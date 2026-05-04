import React from "react";
import ReactDOM from "react-dom/client";
import { AuthProvider } from "./hooks/useAuth";
import App from "./App";
import "./styles/colors_and_type.css";
import "./styles/app.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
