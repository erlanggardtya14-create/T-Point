import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ref, onValue, off } from "firebase/database";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            setAuthUser(firebaseUser);
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!authUser) return;

        const userRef = ref(db, `users/${authUser.uid}`);
        const unsubscribeUser = onValue(userRef, (snapshot) => {
            setUser(snapshot.exists() ? { uid: authUser.uid, ...snapshot.val() } : null);
            setLoading(false);
        });

        return () => off(userRef, "value", unsubscribeUser);
    }, [authUser]);

    const logout = () => signOut(auth);

    const value = {
        user,
        authUser,
        loading,
        isAuthenticated: !!authUser,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth harus dipakai di dalam AuthProvider");
    }
    return context;
}