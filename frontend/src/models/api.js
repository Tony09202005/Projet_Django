import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Token " + token;
  }
  return config;
});

api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    const url = erreur.config && erreur.config.url ? erreur.config.url : "";
    const surConnexion = url.includes("/auth/login") || url.includes("/auth/register");
    if (erreur.response && erreur.response.status === 401 && !surConnexion && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      window.location.href = "/connexion";
    }
    return Promise.reject(erreur);
  }
);

export default api;

export function messageErreur(erreur) {
  if (!erreur.response) {
    return "Impossible de joindre le serveur.";
  }
  const data = erreur.response.data || {};
  let texte = data.message || "Une erreur est survenue.";
  if (data.errors) {
    for (const champ in data.errors) {
      texte += " (" + champ + " : " + data.errors[champ] + ")";
    }
  }
  return texte;
}
