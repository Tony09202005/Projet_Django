import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { METHODES, STATUTS_PAIEMENT, formatPrix } from "../../controllers/outils";
import { messageErreur } from "../../models/api";
import { paiementModel } from "../../models/commandeModel";

export default function Paiement() {
  const { id } = useParams();
  const [paiement, setPaiement] = useState(null);
  const [methode, setMethode] = useState("CARTE");
  const [numeroCarte, setNumeroCarte] = useState("");
  const [numeroTel, setNumeroTel] = useState("");
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    paiementModel.detail(id).then((p) => {
      setPaiement(p);
      setMethode(p.methode);
    }).catch(() => setErreur("Paiement introuvable."));
  }, [id]);

  async function payer(e) {
    e.preventDefault();
    setErreur("");
    setMessage("");
    try {
      const resultat = await paiementModel.payer(id, { methode: methode, numero_carte: numeroCarte, numero_telephone: numeroTel });
      setPaiement(resultat);
      setMessage(resultat.message);
      setNumeroCarte("");
      setNumeroTel("");
    } catch (err) {
      setErreur(messageErreur(err));
    }
  }

  if (!paiement && erreur) return <div className="alert alert-danger">{erreur}</div>;
  if (!paiement) return <p>Chargement...</p>;

  const peutPayer = paiement.statut === "EN_ATTENTE" || paiement.statut === "ECHOUE";

  return (
    <div style={{ maxWidth: 520 }}>
      <h2>Paiement</h2>
      <p>Commande {paiement.commande_reference} - Montant : <strong>{formatPrix(paiement.montant)}</strong></p>
      <p>Statut : <span className={"badge bg-" + STATUTS_PAIEMENT[paiement.statut]}>{paiement.statut}</span></p>

      {message && <div className={"alert alert-" + (paiement.statut === "REUSSI" ? "success" : paiement.statut === "ECHOUE" ? "danger" : "info")}>{message}</div>}
      {erreur && <div className="alert alert-danger">{erreur}</div>}

      {peutPayer ? (
        <form onSubmit={payer}>
          <select className="form-select mb-3" value={methode} onChange={(e) => setMethode(e.target.value)}>
            {METHODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {methode === "CARTE" && (
            <input className="form-control mb-3" placeholder="Numéro de carte" value={numeroCarte} onChange={(e) => setNumeroCarte(e.target.value)} />
          )}
          {methode === "MOBILE_MONEY" && (
            <input className="form-control mb-3" placeholder="Numéro de téléphone" value={numeroTel} onChange={(e) => setNumeroTel(e.target.value)} />
          )}
          {(methode === "VIREMENT" || methode === "ESPECES") && (
            <p className="text-muted">Le paiement sera validé par l'agence à la réception des fonds.</p>
          )}
          <button className="btn btn-danger">Payer</button>
          <p className="text-muted small mt-3">
            Paiement simulé : un numéro qui se termine par 0000 est refusé. Les numéros ne sont pas enregistrés.
          </p>
        </form>
      ) : (
        <Link to={"/mes-commandes/" + paiement.commande} className="btn btn-dark">Voir ma commande</Link>
      )}
    </div>
  );
}
