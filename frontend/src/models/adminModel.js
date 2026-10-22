import api from "./api";

export const adminModel = {
  statistiques: () => api.get("/dashboard/statistiques/").then((r) => r.data),
  utilisateurs: (params) => api.get("/utilisateurs/", { params }).then((r) => r.data),
  modifierUtilisateur: (id, donnees) => api.patch("/utilisateurs/" + id + "/", donnees).then((r) => r.data),
  avis: (params) => api.get("/avis/", { params }).then((r) => r.data),
  approuverAvis: (id) => api.post("/avis/" + id + "/approuver/").then((r) => r.data),
  supprimerAvis: (id) => api.delete("/avis/" + id + "/").then((r) => r.data),
};
