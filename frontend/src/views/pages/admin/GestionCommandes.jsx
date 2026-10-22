import { useEffect, useState } from "react";
import { STATUTS_COMMANDE, formatDate, formatPrix } from "../../../controllers/outils";
import { messageErreur } from "../../../models/api";
import { commandeModel } from "../../../models/commandeModel";
import Pagination from "../../components/Pagination";

const SUITE = { CONFIRMEE: "EN_PREPARATION", EN_PREPARATION: "PRETE", PRETE: "TERMINEE" };

export default function GestionCommandes() {
  const [donnees, setDonnees] = useState(null);
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");
  const [recherche, setRecherche] = useState("");
  const [detail, setDetail] = useState(null);

  function charger() {
    commandeModel.lister({ page: page, statut: statut, search: recherche }).then(setDonnees);
  }

  useEffect(() => {
    charger();
  }, [page, statut, recherche]);

  async function avancer(c) {
    try {
      await commandeModel.changerStatut(c.id, SUITE[c.statut]);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  async function annuler(c) {
    const texte = c.statut === "EN_ATTENTE" ? "Annuler cette commande ?" : "Annuler et rembourser cette commande ?";
    if (!window.confirm(texte)) return;
    try {
      await commandeModel.annuler(c.id);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  return (
    <div>
      <h2>Commandes</h2>
      <div className="d-flex gap-2 mb-3">
        <input className="form-control w-25" placeholder="Référence ou email" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
        <select className="form-select w-25" value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          {Object.keys(STATUTS_COMMANDE).map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {!donnees ? <p>Chargement...</p> : (
        <>
          <table className="table table-hover">
            <thead><tr><th>Référence</th><th>Client</th><th>Date</th><th>Total</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {donnees.results.map((c) => (
                <tr key={c.id}>
                  <td>{c.reference}</td>
                  <td>{c.utilisateur_email}</td>
                  <td>{formatDate(c.date_creation)}</td>
                  <td>{formatPrix(c.total)}</td>
                  <td><span className={"badge bg-" + STATUTS_COMMANDE[c.statut]}>{c.statut}</span></td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-dark me-1" onClick={() => setDetail(c)}>Voir</button>
                    {SUITE[c.statut] && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => avancer(c)}>→ {SUITE[c.statut]}</button>}
                    {!["ANNULEE", "REMBOURSEE", "TERMINEE"].includes(c.statut) && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => annuler(c)}>Annuler</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={donnees.page} pages={donnees.pages} onChange={setPage} />
        </>
      )}

      {detail && (
        <div className="card card-body mt-3">
          <h5>Commande {detail.reference}</h5>
          <p>Client : {detail.utilisateur_email} - Livraison : {detail.mode_livraison} {detail.adresse_livraison}</p>
          <ul>{detail.articles.map((a) => <li key={a.id}>{a.libelle} - {formatPrix(a.prix)}</li>)}</ul>
          <p>Paiement : {detail.paiements.map((p) => p.methode + " (" + p.statut + ")").join(", ")}</p>
          <button className="btn btn-sm btn-outline-secondary align-self-start" onClick={() => setDetail(null)}>Fermer</button>
        </div>
      )}
    </div>
  );
}
