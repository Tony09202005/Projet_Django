import { useEffect, useState } from "react";
import { useAuth } from "../../../controllers/AuthController";
import { formatDate } from "../../../controllers/outils";
import { messageErreur } from "../../../models/api";
import { adminModel } from "../../../models/adminModel";
import Pagination from "../../components/Pagination";

export default function GestionUtilisateurs() {
  const { user } = useAuth();
  const [donnees, setDonnees] = useState(null);
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");

  function charger() {
    adminModel.utilisateurs({ page: page, search: recherche }).then(setDonnees);
  }

  useEffect(() => {
    charger();
  }, [page, recherche]);

  async function modifier(u, changement, question) {
    if (!window.confirm(question)) return;
    try {
      await adminModel.modifierUtilisateur(u.id, changement);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  return (
    <div>
      <h2>Utilisateurs</h2>
      <input className="form-control w-25 mb-3" placeholder="Nom ou email" value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />
      {!donnees ? <p>Chargement...</p> : (
        <>
          <table className="table table-hover">
            <thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Commandes</th><th>Inscrit le</th><th>Actif</th></tr></thead>
            <tbody>
              {donnees.results.map((u) => (
                <tr key={u.id}>
                  <td>{u.prenom} {u.nom}</td>
                  <td>{u.email}</td>
                  <td>
                    <select className="form-select form-select-sm" value={u.role} disabled={u.id === user.id}
                      onChange={(e) => modifier(u, { role: e.target.value }, "Changer le rôle de " + u.email + " en " + e.target.value + " ?")}>
                      <option>CLIENT</option>
                      <option>ADMIN</option>
                    </select>
                  </td>
                  <td>{u.nombre_commandes}</td>
                  <td>{formatDate(u.date_creation)}</td>
                  <td>
                    <input type="checkbox" checked={u.est_active} disabled={u.id === user.id}
                      onChange={() => modifier(u, { est_active: !u.est_active }, (u.est_active ? "Désactiver" : "Réactiver") + " le compte de " + u.email + " ?")} />
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
