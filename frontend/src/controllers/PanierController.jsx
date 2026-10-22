import { createContext, useContext, useEffect, useState } from "react";
import { panierModel } from "../models/panierModel";
import { useAuth } from "./AuthController";

const PanierContext = createContext(null);

export function PanierProvider({ children }) {
  const { user } = useAuth();
  const [panier, setPanier] = useState({ articles: [], nombre_articles: 0, sous_total: 0 });

  function rafraichir() {
    if (user && user.role === "CLIENT") {
      panierModel.voir().then(setPanier).catch(() => {});
    } else {
      setPanier({ articles: [], nombre_articles: 0, sous_total: 0 });
    }
  }

  useEffect(() => {
    rafraichir();
  }, [user]);

  return <PanierContext.Provider value={{ panier, setPanier, rafraichir }}>{children}</PanierContext.Provider>;
}

export function usePanier() {
  return useContext(PanierContext);
}
