import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document with default role 'student'
        const newUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'student', // 'admin', 'faculty', 'student'
          status: 'active', // 'active', 'blocked'
          canManageMOA: false, // only true if admin grants it to faculty
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newUser);
        setUserRole('student');
        setUserData(newUser);
      } else {
        const udata = userSnap.data();
        if (udata.status === 'blocked') {
          await signOut(auth);
          throw new Error('Your account has been blocked by the administrator.');
        }
        setUserRole(udata.role);
        setUserData(udata);
      }
      return user;
    } catch (error) {
      console.error("Error during Google Sign In:", error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
             const udata = userSnap.data();
             if (udata.status === 'blocked') {
                await signOut(auth);
                setCurrentUser(null);
                setUserRole(null);
                setUserData(null);
             } else {
                setUserRole(udata.role);
                setUserData(udata);
             }
          }
        } catch(err) {
          console.error("Error fetching user role on state change:", err);
        }
      } else {
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
