import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import {
  generateUserName,
  getAnimalForUser,
  getColorForUser,
  generateRoomId,
  getTextOffset,
} from './constants';

/**
 * buildLocalUser — Kullanıcı profil bilgilerini hazırlar
 */
function buildLocalUser(googleUser) {
  const saved = localStorage.getItem('hokka_collab_user');
  let parsed = null;
  if (saved) {
    try { parsed = JSON.parse(saved); } catch (e) {}
  }

  if (googleUser) {
    const uid = googleUser.uid;
    const name = googleUser.displayName || googleUser.email?.split('@')[0] || 'Kullanıcı';
    return {
      uid,
      name,
      email: googleUser.email || '',
      color: parsed?.color || getColorForUser(uid),
      animal: parsed?.animal || getAnimalForUser(uid),
      photoURL: googleUser.photoURL || null,
    };
  }

  if (parsed && parsed.name && !parsed.uid) {
    return parsed;
  }

  const name = generateUserName();
  return {
    uid: null,
    name,
    email: '',
    color: getColorForUser(name),
    animal: getAnimalForUser(name),
    photoURL: null,
  };
}

/**
 * useCollaboration — WebRTC P2P Direct Real-time Collaboration Engine
 */
export function useCollaboration({
  editorRef,
  activeDocId,
  title,
  isUpdatingRef,
  onRemoteChange,
  onRemoteTitleChange,
  googleUser,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(activeDocId);
  const [localUser, setLocalUser] = useState(() => buildLocalUser(googleUser));
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [myPermission, setMyPermission] = useState('edit');
  const [isRoomOwner, setIsRoomOwner] = useState(true);

  // Google kullanıcısı değişince localUser güncelle
  useEffect(() => {
    if (googleUser) {
      setLocalUser(buildLocalUser(googleUser));
    }
  }, [googleUser]);

  // Refs
  const peerRef = useRef(null);
  const connectionsRef = useRef([]); // Active WebRTC DataConnections
  const lastHtmlRef = useRef('');
  const lastTitleRef = useRef(title);
  const localUserRef = useRef(localUser);
  const permissionsRef = useRef(permissions);
  const myPermissionRef = useRef(myPermission);
  const isOwnerRef = useRef(isRoomOwner);
  const cursorOffsetRef = useRef(null);

  useEffect(() => { localUserRef.current = localUser; }, [localUser]);
  useEffect(() => { permissionsRef.current = permissions; }, [permissions]);
  useEffect(() => { myPermissionRef.current = myPermission; }, [myPermission]);
  useEffect(() => { isOwnerRef.current = isRoomOwner; }, [isRoomOwner]);
  useEffect(() => { lastTitleRef.current = title; }, [title]);

  // Persist local user
  useEffect(() => {
    localStorage.setItem('hokka_collab_user', JSON.stringify(localUser));
  }, [localUser]);

  const getUserIdentifier = useCallback((user) => {
    if (!user) return null;
    if (user.email) return user.email.toLowerCase();
    if (user.displayName) return user.displayName.toLowerCase().trim();
    if (user.name) return user.name.toLowerCase().trim();
    return user.uid || null;
  }, []);

  // Broadcast data packet to ALL connected peers
  const broadcast = useCallback((data) => {
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        try { conn.send(data); } catch (e) {}
      }
    });
  }, []);

  // Update list of remote users from active connections
  const updateRemoteUsersList = useCallback(() => {
    const activePeers = connectionsRef.current
      .filter(c => c.open && c.peerUser)
      .map(c => ({
        clientId: c.peer,
        name: c.peerUser.name || 'Kullanıcı',
        color: c.peerUser.color || '#8b5cf6',
        animal: c.peerUser.animal || '🐾',
        permission: c.peerUser.permission || 'edit',
        cursor: typeof c.peerCursor === 'number' ? { offset: c.peerCursor } : null,
      }));
    setRemoteUsers(activePeers);
  }, []);

  // Handle incoming message from a peer
  const handlePeerData = useCallback((conn, data) => {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'JOIN_REQUEST':
      case 'PRESENCE': {
        conn.peerUser = data.user;
        updateRemoteUsersList();

        // If I am host/owner or have content, reply with my presence & current document state
        if (data.type === 'JOIN_REQUEST') {
          conn.send({
            type: 'SYNC_STATE',
            title: lastTitleRef.current || 'Untitled Document 📝',
            content: editorRef.current?.innerHTML || lastHtmlRef.current || '',
            permissions: permissionsRef.current,
            ownerUser: localUserRef.current,
          });
        }
        break;
      }

      case 'SYNC_STATE': {
        // We received the document state from the host/peer!
        if (data.title && data.title !== lastTitleRef.current) {
          lastTitleRef.current = data.title;
          onRemoteTitleChange?.(data.title);
        }
        if (typeof data.content === 'string' && data.content !== lastHtmlRef.current) {
          lastHtmlRef.current = data.content;
          if (editorRef.current && !isUpdatingRef.current) {
            isUpdatingRef.current = true;
            editorRef.current.innerHTML = data.content;
            onRemoteChange?.(data.content);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
          }
        }
        if (data.permissions) {
          setPermissions(data.permissions);
        }
        // Send back our presence to complete handshake
        conn.send({
          type: 'PRESENCE',
          user: {
            ...localUserRef.current,
            permission: myPermissionRef.current,
          },
        });
        break;
      }

      case 'CONTENT_CHANGE': {
        if (typeof data.html === 'string' && data.html !== lastHtmlRef.current) {
          lastHtmlRef.current = data.html;
          if (editorRef.current && !isUpdatingRef.current) {
            isUpdatingRef.current = true;
            editorRef.current.innerHTML = data.html;
            onRemoteChange?.(data.html);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
          }
        }
        break;
      }

      case 'TITLE_CHANGE': {
        if (data.title && data.title !== lastTitleRef.current) {
          lastTitleRef.current = data.title;
          onRemoteTitleChange?.(data.title);
        }
        break;
      }

      case 'CURSOR_MOVE': {
        conn.peerCursor = data.offset;
        updateRemoteUsersList();
        break;
      }

      case 'PERMISSIONS_UPDATE': {
        setPermissions(data.permissions || {});
        const myId = getUserIdentifier(googleUser || localUserRef.current);
        const newPerm = isOwnerRef.current ? 'edit' : (data.permissions?.[myId] || 'view');
        setMyPermission(newPerm);
        break;
      }

      default:
        break;
    }
  }, [editorRef, isUpdatingRef, onRemoteChange, onRemoteTitleChange, updateRemoteUsersList, googleUser, getUserIdentifier]);

  // Setup connection handlers for a DataConnection
  const setupConnection = useCallback((conn) => {
    // Avoid duplicate connections
    const existingIdx = connectionsRef.current.findIndex(c => c.peer === conn.peer);
    if (existingIdx !== -1) {
      connectionsRef.current[existingIdx].close();
      connectionsRef.current.splice(existingIdx, 1);
    }
    connectionsRef.current.push(conn);

    conn.on('open', () => {
      setIsConnected(true);
      // Send JOIN_REQUEST with our user profile
      conn.send({
        type: 'JOIN_REQUEST',
        user: {
          ...localUserRef.current,
          permission: myPermissionRef.current,
        },
      });
    });

    conn.on('data', (data) => {
      handlePeerData(conn, data);
    });

    conn.on('close', () => {
      connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
      updateRemoteUsersList();
      if (connectionsRef.current.length === 0) {
        setIsConnected(false);
      }
    });

    conn.on('error', () => {
      connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
      updateRemoteUsersList();
    });
  }, [handlePeerData, updateRemoteUsersList]);

  // Initialize WebRTC Peer Node for activeDocId
  useEffect(() => {
    if (!activeDocId) return;

    setRoomId(activeDocId);
    const sanitizedDocId = activeDocId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const myId = getUserIdentifier(googleUser || localUser) || 'user_' + Math.random().toString(36).substring(2, 7);
    const sanitizedMyId = myId.replace(/[^a-zA-Z0-9_-]/g, '_');

    // Deterministic Peer ID for Host vs Peer
    const peerId = `hokka_${sanitizedDocId}_${sanitizedMyId}`;
    const hostPeerId = `hokka_${sanitizedDocId}_host`;

    const peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    peerRef.current = peer;

    peer.on('open', () => {
      setIsConnected(true);

      // If I am NOT the host, connect to the Host peer!
      if (peerId !== hostPeerId) {
        const conn = peer.connect(hostPeerId, { reliable: true });
        setupConnection(conn);
      } else {
        setIsRoomOwner(true);
      }
    });

    // Listen for incoming peer connections
    peer.on('connection', (conn) => {
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      // If host ID was taken, fallback gracefully
      if (err.type === 'unavailable-id') {
        // We are a guest connecting to the existing host!
      }
      console.warn('WebRTC Peer warning:', err.type);
    });

    return () => {
      connectionsRef.current.forEach(c => c.close());
      connectionsRef.current = [];
      peer.destroy();
      peerRef.current = null;
      setIsConnected(false);
      setRemoteUsers([]);
    };
  }, [activeDocId, googleUser, localUser, setupConnection, getUserIdentifier]);

  // --- Actions ---

  const addPermission = useCallback((identifier, mode) => {
    const key = identifier.toLowerCase().trim();
    if (!key) return;
    setPermissions(prev => {
      const updated = { ...prev, [key]: mode };
      broadcast({ type: 'PERMISSIONS_UPDATE', permissions: updated });
      return updated;
    });
  }, [broadcast]);

  const removePermission = useCallback((identifier) => {
    const key = identifier.toLowerCase().trim();
    if (!key) return;
    setPermissions(prev => {
      const updated = { ...prev };
      delete updated[key];
      broadcast({ type: 'PERMISSIONS_UPDATE', permissions: updated });
      return updated;
    });
  }, [broadcast]);

  const pushLocalChange = useCallback((newHtml) => {
    lastHtmlRef.current = newHtml;
    broadcast({ type: 'CONTENT_CHANGE', html: newHtml });
  }, [broadcast]);

  const pushTitleChange = useCallback((newTitle) => {
    lastTitleRef.current = newTitle;
    broadcast({ type: 'TITLE_CHANGE', title: newTitle });
  }, [broadcast]);

  const updateCursorPosition = useCallback(() => {
    if (!editorRef.current) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const offset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      cursorOffsetRef.current = offset;
      broadcast({ type: 'CURSOR_MOVE', offset });
    }
  }, [editorRef, broadcast]);

  const leaveRoom = useCallback(() => {}, []);
  const joinRoom = useCallback(() => {}, []);

  return {
    isConnected,
    roomId,
    localUser,
    remoteUsers,
    permissions,
    myPermission,
    isRoomOwner,
    joinRoom,
    leaveRoom,
    pushLocalChange,
    pushTitleChange,
    updateCursorPosition,
    addPermission,
    removePermission,
    setLocalUser,
  };
}
