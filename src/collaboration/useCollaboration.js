import { useState, useEffect, useRef, useCallback } from 'react';
import { rtdb, firebaseConfigured } from '../firebase';
import {
  ref,
  onValue,
  set,
  update,
  remove,
  onDisconnect,
} from 'firebase/database';
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
 * sanitizeKey — Firebase Database anahtarındaki geçersiz karakterleri temizler
 */
function sanitizeKey(str) {
  if (!str) return 'user_anon';
  return str.replace(/[.#$/\[\]]/g, '_').toLowerCase().trim();
}

/**
 * useCollaboration — Firebase Realtime Cloud Engine Collab Hook
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
  const [isConnected, setIsConnected] = useState(true);
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
  const lastHtmlRef = useRef('');
  const lastTitleRef = useRef(title);
  const activeDocIdRef = useRef(activeDocId);
  const localUserRef = useRef(localUser);
  const myPermissionRef = useRef(myPermission);
  const cursorOffsetRef = useRef(null);

  useEffect(() => { localUserRef.current = localUser; }, [localUser]);
  useEffect(() => { activeDocIdRef.current = activeDocId; }, [activeDocId]);
  useEffect(() => { lastTitleRef.current = title; }, [title]);
  useEffect(() => { myPermissionRef.current = myPermission; }, [myPermission]);

  // Persist user info
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

  // ===============================================
  // REAL-TIME FIREBASE DATABASE CLOUD ENGINE
  // ===============================================
  useEffect(() => {
    if (!firebaseConfigured || !rtdb || !activeDocId) return;

    setRoomId(activeDocId);
    const sanitizedDocId = sanitizeKey(activeDocId);
    const rawMyId = getUserIdentifier(googleUser || localUser) || ('user_' + Math.random().toString(36).substring(2, 7));
    const myId = sanitizeKey(rawMyId);

    const docRef = ref(rtdb, `documents/${sanitizedDocId}`);
    const presenceRef = ref(rtdb, `presence/${sanitizedDocId}`);
    const myPresenceRef = ref(rtdb, `presence/${sanitizedDocId}/${myId}`);

    // A. Real-time Document Content & Permissions Listener
    const unsubDoc = onValue(docRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // 1. Title Sync
        if (data.title && data.title !== lastTitleRef.current) {
          lastTitleRef.current = data.title;
          onRemoteTitleChange?.(data.title);
        }

        // 2. Content Sync
        if (typeof data.content === 'string' && data.content !== lastHtmlRef.current) {
          lastHtmlRef.current = data.content;
          if (editorRef.current && !isUpdatingRef.current) {
            isUpdatingRef.current = true;
            editorRef.current.innerHTML = data.content;
            onRemoteChange?.(data.content);
            setTimeout(() => { isUpdatingRef.current = false; }, 0);
          }
        }

        // 3. Permissions Sync
        const permMap = data.permissions || {};
        setPermissions(permMap);

        const ownerId = data.ownerId;
        const amOwner = ownerId ? ownerId === myId : true;
        setIsRoomOwner(amOwner);

        const perm = amOwner ? 'edit' : (permMap[myId] || 'view');
        setMyPermission(perm);
      } else {
        // First time initialization in Cloud Database
        const initialHtml = editorRef.current?.innerHTML || '';
        const initialTitle = lastTitleRef.current || 'Untitled Document 📝';
        set(docRef, {
          title: initialTitle,
          content: initialHtml,
          ownerId: myId,
          permissions: { [myId]: 'edit' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }).catch(() => {});

        setIsRoomOwner(true);
        setMyPermission('edit');
      }
      setIsConnected(true);
    });

    // B. Real-time Presence Listener (Animal avatars & Live Cursors)
    const unsubPresence = onValue(presenceRef, (snapshot) => {
      const pData = snapshot.val() || {};
      const now = Date.now();
      const users = [];

      Object.entries(pData).forEach(([key, userState]) => {
        if (key !== myId && userState) {
          if (userState.updatedAt && (now - userState.updatedAt < 20000)) {
            users.push({
              clientId: key,
              name: userState.name || 'Kullanıcı',
              color: userState.color || '#8b5cf6',
              animal: userState.animal || '🐾',
              permission: userState.permission || 'edit',
              cursor: typeof userState.cursorOffset === 'number' ? { offset: userState.cursorOffset } : null,
            });
          }
        }
      });
      setRemoteUsers(users);
    });

    // C. Local Presence Heartbeat & Auto Disconnect Cleanup
    const updateLocalPresence = () => {
      const u = localUserRef.current;
      set(myPresenceRef, {
        name: u.name,
        color: u.color,
        animal: u.animal || '🐾',
        photoURL: u.photoURL || null,
        permission: myPermissionRef.current,
        cursorOffset: cursorOffsetRef.current,
        updatedAt: Date.now(),
      }).catch(() => {});
    };

    updateLocalPresence();
    const heartbeatTimer = setInterval(updateLocalPresence, 4000);

    // Auto cleanup presence on tab close or disconnect
    onDisconnect(myPresenceRef).remove();

    return () => {
      unsubDoc();
      unsubPresence();
      clearInterval(heartbeatTimer);
      remove(myPresenceRef).catch(() => {});
    };
  }, [activeDocId, googleUser, localUser, editorRef, isUpdatingRef, onRemoteChange, onRemoteTitleChange, getUserIdentifier]);

  // --- Actions ---

  const addPermission = useCallback((identifier, mode) => {
    const key = sanitizeKey(identifier);
    if (!key || !activeDocId || !rtdb) return;
    const sanitizedDocId = sanitizeKey(activeDocId);
    const permRef = ref(rtdb, `documents/${sanitizedDocId}/permissions/${key}`);
    set(permRef, mode).catch(() => {});
  }, [activeDocId]);

  const removePermission = useCallback((identifier) => {
    const key = sanitizeKey(identifier);
    if (!key || !activeDocId || !rtdb) return;
    const sanitizedDocId = sanitizeKey(activeDocId);
    const permRef = ref(rtdb, `documents/${sanitizedDocId}/permissions/${key}`);
    remove(permRef).catch(() => {});
  }, [activeDocId]);

  const pushLocalChange = useCallback((newHtml) => {
    lastHtmlRef.current = newHtml;
    if (!activeDocId || !rtdb) return;
    const sanitizedDocId = sanitizeKey(activeDocId);
    const contentRef = ref(rtdb, `documents/${sanitizedDocId}`);
    update(contentRef, {
      content: newHtml,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [activeDocId]);

  const pushTitleChange = useCallback((newTitle) => {
    lastTitleRef.current = newTitle;
    if (!activeDocId || !rtdb) return;
    const sanitizedDocId = sanitizeKey(activeDocId);
    const titleRef = ref(rtdb, `documents/${sanitizedDocId}`);
    update(titleRef, {
      title: newTitle,
      updatedAt: Date.now(),
    }).catch(() => {});
  }, [activeDocId]);

  const updateCursorPosition = useCallback(() => {
    if (!editorRef.current || !activeDocId || !rtdb) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const offset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      cursorOffsetRef.current = offset;
      const sanitizedDocId = sanitizeKey(activeDocId);
      const rawMyId = getUserIdentifier(googleUser || localUser) || 'user_anon';
      const myId = sanitizeKey(rawMyId);
      const myPresenceRef = ref(rtdb, `presence/${sanitizedDocId}/${myId}`);
      update(myPresenceRef, {
        cursorOffset: offset,
        updatedAt: Date.now(),
      }).catch(() => {});
    }
  }, [editorRef, activeDocId, googleUser, localUser, getUserIdentifier]);

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
