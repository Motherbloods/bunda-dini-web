import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserById } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authenticated | unauthenticated

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserById(firebaseUser.uid);
          if (userData && userData.isActive) {
            setCurrentUser(userData);
            setStatus("authenticated");
          } else {
            await auth.signOut();
            setCurrentUser(null);
            setStatus("unauthenticated");
          }
        } catch {
          setCurrentUser(null);
          setStatus("unauthenticated");
        }
      } else {
        setCurrentUser(null);
        setStatus("unauthenticated");
      }
    });
    return unsub;
  }, []);

  const isBidan = currentUser?.role === "bidan";
  const isKader = currentUser?.role === "kader";

  return (
    <AuthContext.Provider value={{ currentUser, status, isBidan, isKader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
