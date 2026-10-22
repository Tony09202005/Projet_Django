import { Link, Outlet } from "react-router-dom";

const LIENS = [
  ["/admin", "Tableau de bord"],
  ["/admin/vehicules", "Véhicules"],
  ["/admin/marques", "Marques"],
  ["/admin/categories", "Catégories"],
  ["/admin/commandes", "Commandes"],
  ["/admin/paiements", "Paiements"],
  ["/admin/avis", "Avis"],
  ["/admin/utilisateurs", "Utilisateurs"],
];

export default function AdminLayout() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-2 bg-light py-3 min-vh-100">
          <h6 className="text-muted">ADMINISTRATION</h6>
          <ul className="nav flex-column">
            {LIENS.map(([url, texte]) => (
              <li className="nav-item" key={url}>
                <Link className="nav-link text-dark" to={url}>{texte}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-md-10 py-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
