import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { STATUTS_COMMANDE, formatDate, formatPrix } from "../../controllers/outils";
import { commandeModel } from "../../models/commandeModel";
import Pagination from "../components/Pagination";

export default function MesCommandes() {
  const [donnees, setDonnees] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    commandeModel.lister({ page: page }).then(setDonnees);
  }, [page]);

  if (!donnees) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Mes commandes</h2>
      {donnees.results.length === 0 && <p>Aucune commande. <Link to="/vehicules">Voir les véhicules</Link></p>}
      {donnees.results.length > 0 && (
        <table className="table table-hover">
          <thead><tr><th>Référence</th><th>Date</th><th>Total</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {donnees.results.map((c) => (
              <tr key={c.id}>
                <td>{c.reference}</td>
                <td>{formatDate(c.date_creation)}</td>
                <td>{formatPrix(c.total)}</td>
                <td><span className={"badge bg-" + STATUTS_COMMANDE[c.statut]}>{c.statut}</span></td>
                <td><Link to={"/mes-commandes/" + c.id} className="btn btn-sm btn-outline-dark">Détail</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Pagination page={donnees.page} pages={donnees.pages} onChange={setPage} />
    </div>
  );
}
