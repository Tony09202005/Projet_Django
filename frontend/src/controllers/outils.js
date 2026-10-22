export function formatPrix(n) {
  return Number(n).toLocaleString("fr-FR") + " €";
}

export function formatDate(texte) {
  if (!texte) return "-";
  return new Date(texte).toLocaleDateString("fr-FR");
}

export const STATUTS_VEHICULE = { DISPONIBLE: "success", RESERVE: "warning", VENDU: "secondary", INDISPONIBLE: "dark" };
export const STATUTS_COMMANDE = {
  EN_ATTENTE: "warning", CONFIRMEE: "info", EN_PREPARATION: "primary", PRETE: "success",
  TERMINEE: "success", ANNULEE: "secondary", REMBOURSEE: "dark",
};
export const STATUTS_PAIEMENT = { EN_ATTENTE: "warning", REUSSI: "success", ECHOUE: "danger", REMBOURSE: "dark" };

export const CARBURANTS = ["ESSENCE", "DIESEL", "HYBRIDE", "ELECTRIQUE", "AUTRE"];
export const TRANSMISSIONS = ["MANUELLE", "AUTOMATIQUE", "SEMI_AUTOMATIQUE"];
export const ETATS = ["NEUF", "OCCASION"];
export const STATUTS_VEHICULE_LISTE = ["DISPONIBLE", "RESERVE", "VENDU", "INDISPONIBLE"];
export const METHODES = ["CARTE", "MOBILE_MONEY", "VIREMENT", "ESPECES"];
