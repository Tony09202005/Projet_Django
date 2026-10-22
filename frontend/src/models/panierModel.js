import api from "./api";

export const panierModel = {
  voir: () => api.get("/panier/").then((r) => r.data),
  ajouter: (vehicule) => api.post("/panier/ajouter/", { vehicule }).then((r) => r.data),
  supprimer: (id) => api.delete("/panier/supprimer/" + id + "/").then((r) => r.data),
  vider: () => api.delete("/panier/vider/").then((r) => r.data),
};

export const favoriModel = {
  lister: () => api.get("/favoris/").then((r) => r.data),
  ajouter: (vehicule) => api.post("/favoris/ajouter/", { vehicule }).then((r) => r.data),
  supprimer: (id) => api.delete("/favoris/supprimer/" + id + "/").then((r) => r.data),
};
