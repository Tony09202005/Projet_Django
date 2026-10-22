import { useEffect, useState } from "react";
import { STATUTS_PAIEMENT, formatDate, formatPrix } from "../../../controllers/outils";
import { messageErreur } from "../../../models/api";
import { paiementModel } from "../../../models/commandeModel";
import Pagination from "../../components/Pagination";

export default function GestionPaiements() {
  const [donnees, setDonnees] = useState(null);
  const [page, setPage] = useState(1);
  const [statut, setStatut] = useState("");

  function charger() {
    paiementModel.lister({ page: page, statut: statut }).then(setDonnees);
  }

  useEffect(() => {
    charger();
  }, [page, statut]);

  async function confirmer(p) {
    if (!window.confirm("Confirmer la réception de " + formatPrix(p.montant) + " ?")) return;
    try {
      await paiementModel.confirmer(p.id);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  return (
    <div>
      <h2>Paiements</h2>
      <select className="form-select w-25 mb-3" value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }}>
        <option value="">Tous les statuts</option>
        {Object.keys(STATUTS_PAIEMENT).map((s) => <option key={s}>{s}</option>)}
      </select>

      {!donnees ? <p>Chargement...</p> : (
        <>
          <table className="table table-hover">
            <thead><tr><th>Référence</th><th>Commande</th><th>Méthode</th><th>Montant</th><th>Date</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {donnees.results.map((p) => (
                <tr key={p.id}>
                  <td>{p.reference}</td>
                  <td>{p.commande_reference}</td>
                  <td>{p.methode}</td>
                  <td>{formatPrix(p.montant)}</td>
                  <td>{formatDate(p.date_paiement || p.date_creation)}</td>
                  <td><span className={"badge bg-" + STATUTS_PAIEMENT[p.statut]}>{p.statut}</span></td>
                  <td>{p.statut === "EN_ATTENTE" && <button className="btn btn-sm btn-success" onClick={() => confirmer(p)}>Confirmer</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={donnees.page} pages={donnees.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
