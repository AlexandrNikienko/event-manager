import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.scss";
import { AuthProvider } from "./AuthProvider.jsx";


createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);