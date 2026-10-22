import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { STATUTS_COMMANDE, STATUTS_PAIEMENT, formatDate, formatPrix } from "../../controllers/outils";
import { messageErreur } from "../../models/api";
import { commandeModel } from "../../models/commandeModel";

export default function DetailCommande() {
  const { id } = useParams();
  const [commande, setCommande] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    commandeModel.detail(id).then(setCommande).catch(() => setErreur("Commande introuvable."));
  }, [id]);

  async function annuler() {
    if (!window.confirm("Annuler cette commande ?")) return;
    try {
      setCommande(await commandeModel.annuler(id));
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  if (erreur) return <div className="alert alert-danger">{erreur}</div>;
  if (!commande) return <p>Chargement...</p>;

  return (
    <div>
      <Link to="/mes-commandes">&larr; Mes commandes</Link>
      <h2 className="mt-2">Commande {commande.reference}</h2>
      <p>
        Date : {formatDate(commande.date_creation)} - Statut :{" "}
        <span className={"badge bg-" + STATUTS_COMMANDE[commande.statut]}>{commande.statut}</span>
      </p>
      <p>Livraison : {commande.mode_livraison} {commande.adresse_livraison && "(" + commande.adresse_livraison + ")"}</p>

      <h5>Véhicules</h5>
      <ul>
        {commande.articles.map((a) => <li key={a.id}>{a.libelle} - {formatPrix(a.prix)}</li>)}
      </ul>
      <p>Sous-total : {formatPrix(commande.sous_total)} - Livraison : {formatPrix(commande.frais_livraison)}</p>
      <h5>Total : {formatPrix(commande.total)}</h5>

      <h5 className="mt-3">Paiement</h5>
      {commande.paiements.map((p) => (
        <p key={p.id}>
          {p.methode} - {formatPrix(p.montant)} -{" "}
          <span className={"badge bg-" + STATUTS_PAIEMENT[p.statut]}>{p.statut}</span>{" "}
          {commande.statut === "EN_ATTENTE" && (p.statut === "EN_ATTENTE" || p.statut === "ECHOUE") && (
            <Link to={"/paiement/" + p.id} className="btn btn-sm btn-danger ms-2">Payer</Link>
          )}
        </p>
      ))}

      {commande.statut === "EN_ATTENTE" && <button className="btn btn-outline-danger" onClick={annuler}>Annuler la commande</button>}
    </div>
  );
}
