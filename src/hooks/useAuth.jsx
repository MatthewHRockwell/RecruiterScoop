import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getBrowserFingerprint } from '../utils/helper';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [userFingerprint, setUserFingerprint] = useState('');

  useEffect(() => {
    // 1. Auth Init
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { await signInAnonymously(auth); }
    };
    initAuth();

    // 2. Fingerprint
    setUserFingerprint(getBrowserFingerprint());

    // 3. Location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => { if (data.city) setUserLocation(data.city); })
      .catch(() => console.log('Location default: Global'));

    // 4. Listener
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return { user, userLocation, userFingerprint };
};