import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, googleProvider, firebaseConfigured } from '../firebase';

// Koşullu olarak firebase/auth import et — yalnızca yapılandırılmışsa kullanılır
let onAuthStateChanged = null;
let signInWithPopup = null;
let signOut = null;

if (firebaseConfigured) {
  // Bu blok yalnızca Firebase aktifken çalışır
  import('firebase/auth').then((mod) => {
    onAuthStateChanged = mod.onAuthStateChanged;
    signInWithPopup = mod.signInWithPopup;
    signOut = mod.signOut;
  });
}

const AuthContext = createContext(null);

/**
 * AuthProvider — İki modda çalışır:
 *   1. Firebase yapılandırıldıysa: Google ile giriş
 *   2. Firebase yoksa: İsim girerek anonim giriş
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = yükleniyor
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      // Anonim mod
      const saved = localStorage.getItem('hokka_anon_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); return; } catch { /* ignore */ }
      }
      setUser(null);
      return;
    }

    // Firebase mod — auth state dinle
    let unsub = () => {};

    // Küçük gecikme: dinamik import'un tamamlanmasını bekle
    const timer = setTimeout(() => {
      if (onAuthStateChanged && auth) {
        unsub = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser);
        });
      } else {
        setUser(null);
      }
    }, 100);

    return () => { clearTimeout(timer); unsub(); };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      if (!auth || !googleProvider || !signInWithPopup) {
        throw new Error('Firebase henüz hazır değil, lütfen tekrar deneyin.');
      }
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    }
  }, []);

  const signInAnonymously = useCallback((name) => {
    const anonUser = {
      uid: 'anon-' + Date.now().toString(36),
      displayName: name.trim(),
      photoURL: null,
      isAnonymous: true,
    };
    localStorage.setItem('hokka_anon_user', JSON.stringify(anonUser));
    setUser(anonUser);
  }, []);

  const signOutUser = useCallback(async () => {
    if (firebaseConfigured && auth && signOut) {
      try { await signOut(auth); } catch { /* ignore */ }
    } else {
      localStorage.removeItem('hokka_anon_user');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      firebaseConfigured,
      signInWithGoogle,
      signInAnonymously,
      signOutUser,
      error,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
