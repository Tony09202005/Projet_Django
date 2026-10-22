import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import App from "./App.jsx";
import { AuthProvider } from "./controllers/AuthController.jsx";
import { PanierProvider } from "./controllers/PanierController.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PanierProvider>
          <App />
        </PanierProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
