import React from "react";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "../firebase";
import { Button } from "antd";
import { GoogleIcon } from "../utils/icons";

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
    <Button onClick={loginWithGoogle}>
      Sign in with <GoogleIcon />
    </Button>
  );
}
