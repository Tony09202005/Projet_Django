import api from "./api";

export const commandeModel = {
  lister: (params) => api.get("/commandes/", { params }).then((r) => r.data),
  detail: (id) => api.get("/commandes/" + id + "/").then((r) => r.data),
  creer: (donnees) => api.post("/commandes/", donnees).then((r) => r.data),
  annuler: (id) => api.post("/commandes/" + id + "/annuler/").then((r) => r.data),
  changerStatut: (id, statut) => api.post("/commandes/" + id + "/statut/", { statut }).then((r) => r.data),
};

export const paiementModel = {
  lister: (params) => api.get("/paiements/", { params }).then((r) => r.data),
  detail: (id) => api.get("/paiements/" + id + "/").then((r) => r.data),
  payer: (id, donnees) => api.post("/paiements/" + id + "/payer/", donnees).then((r) => r.data),
  confirmer: (id) => api.post("/paiements/" + id + "/confirmer/").then((r) => r.data),
};
