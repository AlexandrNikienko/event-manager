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
    <button onClick={loginWithGoogle}>
      Sign in with Google
    </button>
  );
}
