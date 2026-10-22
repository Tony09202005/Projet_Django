import { useEffect, useState } from "react";
import { formatDate } from "../../../controllers/outils";
import { messageErreur } from "../../../models/api";
import { adminModel } from "../../../models/adminModel";
import Pagination from "../../components/Pagination";

export default function GestionAvis() {
  const [donnees, setDonnees] = useState(null);
  const [page, setPage] = useState(1);
  const [filtre, setFiltre] = useState("false");

  function charger() {
    adminModel.avis({ page: page, est_approuve: filtre }).then(setDonnees);
  }

  useEffect(() => {
    charger();
  }, [page, filtre]);

  async function approuver(a) {
    try {
      await adminModel.approuverAvis(a.id);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  async function supprimer(a) {
    if (!window.confirm("Supprimer cet avis ?")) return;
    try {
      await adminModel.supprimerAvis(a.id);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  return (
    <div>
      <h2>Avis</h2>
      <select className="form-select w-25 mb-3" value={filtre} onChange={(e) => { setFiltre(e.target.value); setPage(1); }}>
        <option value="false">En attente</option>
        <option value="true">Approuvés</option>
        <option value="">Tous</option>
      </select>
      {!donnees ? <p>Chargement...</p> : (
        <>
          {donnees.results.length === 0 && <p>Aucun avis.</p>}
          <table className="table table-hover">
            <thead><tr><th>Véhicule</th><th>Client</th><th>Note</th><th>Commentaire</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {donnees.results.map((a) => (
                <tr key={a.id}>
                  <td>{a.vehicule_libelle}</td>
                  <td>{a.utilisateur_email}</td>
                  <td>{a.note}/5</td>
                  <td>{a.commentaire}</td>
                  <td>{formatDate(a.date_creation)}</td>
                  <td className="text-end">
                    {!a.est_approuve && <button className="btn btn-sm btn-success me-1" onClick={() => approuver(a)}>Approuver</button>}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => supprimer(a)}>Supprimer</button>
                  </td>
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
