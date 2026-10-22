import api from "./api";

export const authModel = {
  inscription: (donnees) => api.post("/auth/register/", donnees).then((r) => r.data),
  connexion: (email, password) => api.post("/auth/login/", { email, password }).then((r) => r.data),
  deconnexion: () => api.post("/auth/logout/").then((r) => r.data),
  moi: () => api.get("/auth/me/").then((r) => r.data),
  modifierProfil: (donnees) => api.patch("/auth/me/", donnees).then((r) => r.data),
};
