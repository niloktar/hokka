import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  COLLAB_SERVER_URL,
  generateUserName,
  getAnimalForUser,
  getColorForUser,
  generateRoomId,
  applyDiff,
  getTextOffset,
  restoreCursorFromOffset,
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
 * useCollaboration — Yjs WebSocket CRDT Collaboration Engine
 */
export function useCollaboration({
  editorRef,
  activeDocId,
  title,
  isUpdatingRef,
  onRemoteChange,
  onRemoteTitleChange,
  googleUser,
  isOwner = true,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [localUser, setLocalUser] = useState(() => buildLocalUser(googleUser));
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [myPermission, setMyPermission] = useState('edit');
  const [isRoomOwner, setIsRoomOwner] = useState(isOwner);

  useEffect(() => {
    if (googleUser) {
      setLocalUser(buildLocalUser(googleUser));
    }
  }, [googleUser]);

  const ydocRef = useRef(null);
  const providerRef = useRef(null);
  const ytextRef = useRef(null);
  const ytitleRef = useRef(null);
  const ypermissionsRef = useRef(null);
  const lastHtmlRef = useRef('');
  const lastTitleRef = useRef(title);
  const localUserRef = useRef(localUser);

  useEffect(() => { localUserRef.current = localUser; }, [localUser]);
  useEffect(() => { lastTitleRef.current = title; }, [title]);

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

  // Awareness Broadcast Helper
  const syncAwareness = useCallback(() => {
    if (providerRef.current && localUserRef.current) {
      const currentUser = localUserRef.current;
      const myId = getUserIdentifier(googleUser || currentUser);
      providerRef.current.awareness.setLocalStateField('user', {
        uid: currentUser.uid || null,
        name: currentUser.name,
        color: currentUser.color,
        animal: currentUser.animal || '🐾',
        photoURL: currentUser.photoURL || null,
        permission: myPermission,
        identifier: myId,
      });
    }
  }, [googleUser, myPermission, getUserIdentifier]);

  useEffect(() => {
    syncAwareness();
  }, [syncAwareness]);

  const joinRoom = useCallback((roomName) => {
    if (providerRef.current) providerRef.current.destroy();
    if (ydocRef.current) ydocRef.current.destroy();

    const rid = roomName || generateRoomId();
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('content');
    const ytitle = ydoc.getText('title');
    const ypermissions = ydoc.getMap('permissions');

    const serverUrl = COLLAB_SERVER_URL;
    const provider = new WebsocketProvider(serverUrl, `hokka-${rid}`, ydoc);

    ydocRef.current = ydoc;
    providerRef.current = provider;
    ytextRef.current = ytext;
    ytitleRef.current = ytitle;
    ypermissionsRef.current = ypermissions;

    setRoomId(rid);
    setIsConnected(provider.wsconnected);

    provider.on('status', ({ status }) => {
      setIsConnected(status === 'connected');
    });

    provider.on('sync', (isSynced) => {
      if (!isSynced) return;

      const currentUser = localUserRef.current;
      const myId = getUserIdentifier(googleUser || currentUser);

      const ownerId = ypermissions.get('__owner');
      const amOwner = isOwner || (ownerId ? ownerId === myId : true);
      if (amOwner && myId) {
        ypermissions.set('__owner', myId);
        ypermissions.set(myId, 'edit');
      }
      setIsRoomOwner(amOwner);

      const permObj = {};
      ypermissions.forEach((val, key) => { permObj[key] = val; });
      setPermissions(permObj);

      const myPerm = amOwner ? 'edit' : (ypermissions.get(myId) || 'view');
      setMyPermission(myPerm);

      // Broadcast awareness
      provider.awareness.setLocalStateField('user', {
        uid: currentUser.uid || null,
        name: currentUser.name,
        color: currentUser.color,
        animal: currentUser.animal || '🐾',
        photoURL: currentUser.photoURL || null,
        permission: myPerm,
        identifier: myId,
      });

      // Synchronize Document Text
      const currentHtml = editorRef.current?.innerHTML || '';
      const currentTitle = lastTitleRef.current || 'Untitled Document 📝';
      const ytextContent = ytext.toString();
      const ytitleContent = ytitle.toString();

      if (ytextContent === '' && currentHtml !== '') {
        ytext.insert(0, currentHtml);
        lastHtmlRef.current = currentHtml;
      } else if (ytextContent !== '') {
        if (editorRef.current) {
          isUpdatingRef.current = true;
          editorRef.current.innerHTML = ytextContent;
          lastHtmlRef.current = ytextContent;
          onRemoteChange?.(ytextContent);
          setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
      }

      if (ytitleContent === '' && currentTitle !== '') {
        ytitle.insert(0, currentTitle);
      } else if (ytitleContent !== '' && ytitleContent !== currentTitle) {
        onRemoteTitleChange?.(ytitleContent);
      }
    });

    // Handle Text Changes
    ytext.observe((event) => {
      if (event.transaction.local) return;
      const newHtml = ytext.toString();
      if (newHtml === lastHtmlRef.current || !editorRef.current) return;

      lastHtmlRef.current = newHtml;
      if (isUpdatingRef) isUpdatingRef.current = true;

      const sel = window.getSelection();
      let currentOffset = null;
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        currentOffset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      }

      editorRef.current.innerHTML = newHtml;
      onRemoteChange?.(newHtml);

      if (currentOffset !== null) {
        restoreCursorFromOffset(editorRef.current, currentOffset);
      }

      if (isUpdatingRef) {
        setTimeout(() => { isUpdatingRef.current = false; }, 0);
      }
    });

    // Handle Title Changes
    ytitle.observe((event) => {
      if (event.transaction.local) return;
      const newTitle = ytitle.toString();
      if (newTitle !== lastTitleRef.current) {
        lastTitleRef.current = newTitle;
        onRemoteTitleChange?.(newTitle);
      }
    });

    // Handle Permissions Changes
    ypermissions.observe(() => {
      const permObj = {};
      ypermissions.forEach((val, key) => { permObj[key] = val; });
      setPermissions(permObj);

      const currentUser = localUserRef.current;
      const myId = getUserIdentifier(googleUser || currentUser);

      const ownerId = ypermissions.get('__owner');
      const amOwner = isOwner || (ownerId ? ownerId === myId : true);
      setIsRoomOwner(amOwner);

      const newPerm = amOwner ? 'edit' : (ypermissions.get(myId) || 'view');
      setMyPermission(newPerm);

      if (providerRef.current) {
        const currentState = providerRef.current.awareness.getLocalState()?.user || {};
        providerRef.current.awareness.setLocalStateField('user', {
          ...currentState,
          permission: newPerm,
        });
      }
    });

    // Handle Awareness Changes (Remote User Avatars & Cursors)
    const onAwarenessChange = () => {
      const states = provider.awareness.getStates();
      const users = [];
      states.forEach((state, clientId) => {
        if (clientId !== ydoc.clientID && state.user) {
          users.push({
            clientId,
            ...state.user,
            cursor: state.cursor || null,
          });
        }
      });
      setRemoteUsers(users);
    };

    provider.awareness.on('change', onAwarenessChange);
  }, [editorRef, isUpdatingRef, onRemoteChange, onRemoteTitleChange, googleUser, isOwner, getUserIdentifier]);

  // Auto-join room when activeDocId changes
  useEffect(() => {
    if (activeDocId) {
      joinRoom(activeDocId);
    }
  }, [activeDocId, joinRoom]);

  const leaveRoom = useCallback(() => {
    if (providerRef.current) providerRef.current.destroy();
    if (ydocRef.current) ydocRef.current.destroy();
    ydocRef.current = null;
    providerRef.current = null;
    ytextRef.current = null;
    ytitleRef.current = null;
    ypermissionsRef.current = null;
    setIsConnected(false);
    setRoomId(null);
    setRemoteUsers([]);
    setPermissions({});
  }, []);

  const addPermission = useCallback((identifier, mode) => {
    if (!ypermissionsRef.current) return;
    const key = identifier.toLowerCase().trim();
    if (!key) return;
    ypermissionsRef.current.set(key, mode);
  }, []);

  const removePermission = useCallback((identifier) => {
    if (!ypermissionsRef.current) return;
    ypermissionsRef.current.delete(identifier.toLowerCase().trim());
  }, []);

  const pushLocalChange = useCallback((newHtml) => {
    if (!ytextRef.current) return;
    const currentYText = ytextRef.current.toString();
    if (newHtml === currentYText) return;

    ydocRef.current?.transact(() => {
      applyDiff(ytextRef.current, currentYText, newHtml);
    });
    lastHtmlRef.current = newHtml;
  }, []);

  const pushTitleChange = useCallback((newTitle) => {
    if (!ytitleRef.current) return;
    const currentYTitle = ytitleRef.current.toString();
    if (newTitle === currentYTitle) return;

    ydocRef.current?.transact(() => {
      ytitleRef.current.delete(0, currentYTitle.length);
      ytitleRef.current.insert(0, newTitle);
    });
    lastTitleRef.current = newTitle;
  }, []);

  const updateCursorPosition = useCallback(() => {
    if (!providerRef.current || !editorRef.current) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const offset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      providerRef.current.awareness.setLocalStateField('cursor', { offset });
    }
  }, [editorRef]);

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
