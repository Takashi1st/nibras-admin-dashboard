"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isSuperAdminEmail =
          currentUser.email?.trim().toLowerCase() === "abdoark7@gmail.com";
        if (isSuperAdminEmail) {
          setIsAdmin(true);
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists() && userDoc.data()?.role === "admin") {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (e) {
            console.error("Error verifying admin role:", e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const isSuper = cred.user.email?.trim().toLowerCase() === "abdoark7@gmail.com";
      if (!isSuper) {
        const userDoc = await getDoc(doc(db, "users", cred.user.uid));
        if (!userDoc.exists() || userDoc.data()?.role !== "admin") {
          await signOut(auth);
          return {
            success: false,
            error: "عذراً، هذا الحساب ليس لديه صلاحية الوصول للوحة التحكم الإدارية.",
          };
        }
      }
      return { success: true };
    } catch (err: any) {
      let msg = "تعذر تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "بيانات الدخول غير صحيحة.";
      } else if (err.code === "auth/user-not-found") {
        msg = "لم يتم العثور على حساب بهذا البريد.";
      }
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
