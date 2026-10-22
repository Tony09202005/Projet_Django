import { createContext, useContext, useEffect, useState } from "react";
import { authModel } from "../models/authModel";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      setChargement(false);
      return;
    }
    authModel
      .moi()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setChargement(false));
  }, []);

  async function connexion(email, password) {
    const data = await authModel.connexion(email, password);
    localStorage.setItem("token", data.token);
    setUser(data.utilisateur);
    return data.utilisateur;
  }

  async function inscription(donnees) {
    const data = await authModel.inscription(donnees);
    localStorage.setItem("token", data.token);
    setUser(data.utilisateur);
    return data.utilisateur;
  }

  async function deconnexion() {
    try {
      await authModel.deconnexion();
    } catch (e) {
      
    }
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, chargement, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
