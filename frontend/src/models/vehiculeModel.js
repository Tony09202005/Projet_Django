import api from "./api";

export const vehiculeModel = {
  lister: (params) => api.get("/vehicules/", { params }).then((r) => r.data),
  detail: (id) => api.get("/vehicules/" + id + "/").then((r) => r.data),
  creer: (donnees) => api.post("/vehicules/", donnees).then((r) => r.data),
  modifier: (id, donnees) => api.patch("/vehicules/" + id + "/", donnees).then((r) => r.data),
  supprimer: (id) => api.delete("/vehicules/" + id + "/").then((r) => r.data),
  ajouterAvis: (id, donnees) => api.post("/vehicules/" + id + "/avis/", donnees).then((r) => r.data),
};

export const marqueModel = {
  lister: () => api.get("/marques/").then((r) => r.data),
  creer: (donnees) => api.post("/marques/", donnees).then((r) => r.data),
  modifier: (id, donnees) => api.patch("/marques/" + id + "/", donnees).then((r) => r.data),
  supprimer: (id) => api.delete("/marques/" + id + "/").then((r) => r.data),
};

export const categorieModel = {
  lister: () => api.get("/categories/").then((r) => r.data),
  creer: (donnees) => api.post("/categories/", donnees).then((r) => r.data),
  modifier: (id, donnees) => api.patch("/categories/" + id + "/", donnees).then((r) => r.data),
  supprimer: (id) => api.delete("/categories/" + id + "/").then((r) => r.data),
};
