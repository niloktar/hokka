import { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { db, firebaseConfigured } from '../firebase';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  serverTimestamp,
} from 'firebase/firestore';
import {
  COLLAB_SERVER_URL,
  generateUserName,
  getRandomColor,
  getAnimalForUser,
  getColorForUser,
  generateRoomId,
  applyDiff,
  getTextOffset,
  restoreCursorFromOffset,
} from './constants';

/**
 * buildLocalUser — Kullanıcı bilgilerini hazırlar
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
 * useCollaboration — Ana ortak çalışma hook'u (Firestore + Yjs Dual Provider)
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
  // --- State ---
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

  // --- Refs ---
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

  // --- Kullanıcı tanımlayıcısı: email varsa email, yoksa ad ---
  const getUserIdentifier = useCallback((user) => {
    if (!user) return null;
    if (user.email) return user.email.toLowerCase();
    if (user.displayName) return user.displayName.toLowerCase().trim();
    if (user.name) return user.name.toLowerCase().trim();
    return user.uid || null;
  }, []);

  // ==========================================
  // 1. FIRESTORE REAL-TIME PROVIDER (PRIMARY)
  // ==========================================
  useEffect(() => {
    if (!firebaseConfigured || !db || !activeDocId) return;

    setRoomId(activeDocId);
    const myId = getUserIdentifier(googleUser || localUser) || 'user_' + Math.random().toString(36).substring(2, 7);
    const docRef = doc(db, 'hokka_documents', activeDocId);
    const presenceCollRef = collection(db, 'hokka_documents', activeDocId, 'presence');

    // A. Document Content & Permissions Snapshot Listener
    const unsubDoc = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

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
        // Document does not exist in Firestore → Create initial cloud entry
        const initialHtml = editorRef.current?.innerHTML || '';
        const initialTitle = lastTitleRef.current || 'Untitled Document 📝';
        setDoc(docRef, {
          title: initialTitle,
          content: initialHtml,
          ownerId: myId,
          permissions: { [myId]: 'edit' },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }).catch(err => console.warn('Firestore doc create error:', err));

        setIsRoomOwner(true);
        setMyPermission('edit');
      }
      setIsConnected(true);
    }, (err) => {
      console.warn('Firestore doc snapshot error:', err);
    });

    // B. Presence Snapshot Listener (Animal avatars & Remote cursors)
    const unsubPresence = onSnapshot(presenceCollRef, (presenceSnap) => {
      const now = Date.now();
      const users = [];
      presenceSnap.forEach((pSnap) => {
        if (pSnap.id !== myId) {
          const pData = pSnap.data();
          // Keep users active within last 20 seconds
          if (pData.updatedAt && (now - pData.updatedAt < 20000)) {
            users.push({
              clientId: pSnap.id,
              name: pData.name || 'Kullanıcı',
              color: pData.color || '#8b5cf6',
              animal: pData.animal || '🐾',
              permission: pData.permission || 'edit',
              cursor: typeof pData.cursorOffset === 'number' ? { offset: pData.cursorOffset } : null,
            });
          }
        }
      });
      setRemoteUsers(users);
    }, (err) => {
      console.warn('Firestore presence snapshot error:', err);
    });

    // C. Local Presence Heartbeat
    const updateLocalPresence = () => {
      const u = localUserRef.current;
      const pDocRef = doc(db, 'hokka_documents', activeDocId, 'presence', myId);
      setDoc(pDocRef, {
        name: u.name,
        color: u.color,
        animal: u.animal || '🐾',
        photoURL: u.photoURL || null,
        permission: myPermissionRef.current,
        cursorOffset: cursorOffsetRef.current,
        updatedAt: Date.now(),
      }, { merge: true }).catch(() => {});
    };

    updateLocalPresence();
    const heartbeatTimer = setInterval(updateLocalPresence, 4000);

    // Cleanup on unmount or activeDocId change
    return () => {
      unsubDoc();
      unsubPresence();
      clearInterval(heartbeatTimer);
      // Remove presence entry on leave
      const pDocRef = doc(db, 'hokka_documents', activeDocId, 'presence', myId);
      deleteDoc(pDocRef).catch(() => {});
    };
  }, [activeDocId, googleUser, localUser, editorRef, isUpdatingRef, onRemoteChange, onRemoteTitleChange, getUserIdentifier]);

  // --- Actions ---

  /** Belirli bir kişiye izin ver (Firestore) */
  const addPermission = useCallback((identifier, mode) => {
    const key = identifier.toLowerCase().trim();
    if (!key || !activeDocId || !db) return;
    const docRef = doc(db, 'hokka_documents', activeDocId);
    updateDoc(docRef, {
      [`permissions.${key}`]: mode,
      updatedAt: Date.now(),
    }).catch(err => console.warn('addPermission error:', err));
  }, [activeDocId]);

  /** Kişinin iznini kaldır (Firestore) */
  const removePermission = useCallback((identifier) => {
    const key = identifier.toLowerCase().trim();
    if (!key || !activeDocId || !db) return;
    const docRef = doc(db, 'hokka_documents', activeDocId);
    updateDoc(docRef, {
      [`permissions.${key}`]: deleteField(),
      updatedAt: Date.now(),
    }).catch(err => console.warn('removePermission error:', err));
  }, [activeDocId]);

  /** Yerel metin değişikliğini Firestore'a gönder */
  const pushLocalChange = useCallback((newHtml) => {
    lastHtmlRef.current = newHtml;
    if (!activeDocId || !db) return;
    const docRef = doc(db, 'hokka_documents', activeDocId);
    updateDoc(docRef, {
      content: newHtml,
      updatedAt: Date.now(),
    }).catch(err => console.warn('pushLocalChange error:', err));
  }, [activeDocId]);

  /** Yerel başlık değişikliğini Firestore'a gönder */
  const pushTitleChange = useCallback((newTitle) => {
    lastTitleRef.current = newTitle;
    if (!activeDocId || !db) return;
    const docRef = doc(db, 'hokka_documents', activeDocId);
    updateDoc(docRef, {
      title: newTitle,
      updatedAt: Date.now(),
    }).catch(err => console.warn('pushTitleChange error:', err));
  }, [activeDocId]);

  /** İmleç konumunu Firestore presence'e anlık yayınla */
  const updateCursorPosition = useCallback(() => {
    if (!editorRef.current || !activeDocId || !db) return;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
      const offset = getTextOffset(editorRef.current, sel.anchorNode, sel.anchorOffset);
      cursorOffsetRef.current = offset;
      const myId = getUserIdentifier(googleUser || localUser) || 'user_anon';
      const pDocRef = doc(db, 'hokka_documents', activeDocId, 'presence', myId);
      updateDoc(pDocRef, {
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
