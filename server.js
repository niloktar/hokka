import http from 'http';
import { WebSocketServer } from 'ws';
import * as Y from 'yjs';

/**
 * Hokka Collab Server
 * 
 * Minimal Yjs document relay server.
 * Manages Y.Doc instances per room and broadcasts updates between clients.
 * Also handles the Yjs awareness protocol for cursor/presence sharing.
 */

// In-memory document store: roomName → { doc, conns, awareness }
const rooms = new Map();

// Yjs message types (sync protocol)
const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

// Sync protocol sub-types
const SYNC_STEP1 = 0;
const SYNC_STEP2 = 1;
const SYNC_UPDATE = 2;

function getRoom(roomName) {
  if (!rooms.has(roomName)) {
    const doc = new Y.Doc();
    rooms.set(roomName, {
      doc,
      conns: new Set(),
      awarenessStates: new Map(),
    });
  }
  return rooms.get(roomName);
}

function broadcastToRoom(room, data, excludeWs = null) {
  room.conns.forEach(ws => {
    if (ws !== excludeWs && ws.readyState === 1) {
      ws.send(data);
    }
  });
}

// Encode a Uint8Array with a message type prefix
function encodeMessage(type, data) {
  const msg = new Uint8Array(1 + data.length);
  msg[0] = type;
  msg.set(data, 1);
  return msg;
}

// Simple varint encoding/decoding for Yjs protocol compatibility
function writeVarUint(encoder, num) {
  while (num > 127) {
    encoder.push(128 | (num & 127));
    num >>>= 7;
  }
  encoder.push(num & 127);
}

function readVarUint(data, offset) {
  let num = 0;
  let shift = 0;
  let byte;
  do {
    byte = data[offset++];
    num |= (byte & 127) << shift;
    shift += 7;
  } while (byte >= 128);
  return { value: num, offset };
}

const server = http.createServer((_req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
  });
  res.end('Hokka Collab Server is running ✓');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  // Room name from URL path: /roomName
  const roomName = req.url?.slice(1) || 'default';
  const room = getRoom(roomName);
  room.conns.add(ws);

  // Send current document state to new client (sync step 1 response)
  const stateVector = Y.encodeStateAsUpdate(room.doc);
  
  // Build sync step 2 message: [MSG_SYNC, SYNC_STEP2, ...update]
  const syncMsg = new Uint8Array(2 + stateVector.length);
  syncMsg[0] = MSG_SYNC;
  syncMsg[1] = SYNC_STEP2;
  syncMsg.set(stateVector, 2);
  ws.send(syncMsg);

  // Send existing awareness states
  room.awarenessStates.forEach((state, clientId) => {
    if (state) {
      const awarenessData = encodeAwarenessUpdate([{ clientId, state }]);
      ws.send(encodeMessage(MSG_AWARENESS, awarenessData));
    }
  });

  ws.on('message', (data) => {
    try {
      const msg = new Uint8Array(data);
      if (msg.length === 0) return;

      const msgType = msg[0];

      if (msgType === MSG_SYNC) {
        const syncType = msg[1];
        const payload = msg.slice(2);

        if (syncType === SYNC_STEP1) {
          // Client requesting sync — send our state
          const sv = payload;
          const update = Y.encodeStateAsUpdate(room.doc, sv);
          const response = new Uint8Array(2 + update.length);
          response[0] = MSG_SYNC;
          response[1] = SYNC_STEP2;
          response.set(update, 2);
          ws.send(response);
        } else if (syncType === SYNC_STEP2 || syncType === SYNC_UPDATE) {
          // Apply update to server doc
          Y.applyUpdate(room.doc, payload);
          // Broadcast to other clients as SYNC_UPDATE
          const broadcastMsg = new Uint8Array(2 + payload.length);
          broadcastMsg[0] = MSG_SYNC;
          broadcastMsg[1] = SYNC_UPDATE;
          broadcastMsg.set(payload, 2);
          broadcastToRoom(room, broadcastMsg, ws);
        }
      } else if (msgType === MSG_AWARENESS) {
        // Broadcast awareness to all other clients
        broadcastToRoom(room, msg, ws);
      }
    } catch (err) {
      console.error('Message handling error:', err.message);
    }
  });

  ws.on('close', () => {
    room.conns.delete(ws);
    // Clean up empty rooms after a delay
    if (room.conns.size === 0) {
      setTimeout(() => {
        if (room.conns.size === 0) {
          room.doc.destroy();
          rooms.delete(roomName);
        }
      }, 30000); // Keep room alive for 30s after last disconnect
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
    room.conns.delete(ws);
  });
});

// Simple awareness update encoder (minimal)
function encodeAwarenessUpdate(updates) {
  const encoder = [];
  writeVarUint(encoder, updates.length);
  for (const { clientId, state } of updates) {
    writeVarUint(encoder, clientId);
    const stateStr = JSON.stringify(state);
    const stateBytes = new TextEncoder().encode(stateStr);
    writeVarUint(encoder, stateBytes.length);
    for (const b of stateBytes) encoder.push(b);
  }
  return new Uint8Array(encoder);
}

const PORT = process.env.PORT || 4444;
server.listen(PORT, () => {
  console.log('');
  console.log('  🔌 Hokka Collab Server');
  console.log(`  ➜ WebSocket: ws://localhost:${PORT}`);
  console.log('  ➜ Ready for connections');
  console.log('');
});
