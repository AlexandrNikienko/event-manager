// src/components/LoginButton.jsx
import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function LoginButton() {
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <button onClick={loginWithGoogle} style={{ padding: '4px 8px', fontSize: '1rem', cursor: 'pointer' }}>
      Sign in with Google
    </button>
  );
}
