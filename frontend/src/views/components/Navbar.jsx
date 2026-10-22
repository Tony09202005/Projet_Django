import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthController";
import { usePanier } from "../../controllers/PanierController";

export default function Navbar() {
  const { user, deconnexion } = useAuth();
  const { panier } = usePanier();
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);

  async function quitter() {
    await deconnexion();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-car-front-fill text-danger"></i> AutoShop
        </Link>
        <button className="navbar-toggler" onClick={() => setOuvert(!ouvert)}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={"collapse navbar-collapse " + (ouvert ? "show" : "")} onClick={() => setOuvert(false)}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Accueil</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/vehicules">Véhicules</Link></li>
          </ul>
          <ul className="navbar-nav">
            {user && user.role === "CLIENT" && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/favoris">Favoris</Link></li>
                <li className="nav-item">
                  <Link className="nav-link" to="/panier">
                    Panier {panier.nombre_articles > 0 && <span className="badge bg-danger">{panier.nombre_articles}</span>}
                  </Link>
                </li>
                <li className="nav-item"><Link className="nav-link" to="/mes-commandes">Mes commandes</Link></li>
              </>
            )}
            {user && user.role === "ADMIN" && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Administration</Link></li>
            )}
            {user ? (
              <>
                <li className="nav-item"><Link className="nav-link" to="/profil">{user.prenom}</Link></li>
                <li className="nav-item"><button className="btn btn-outline-light btn-sm mt-1" onClick={quitter}>Déconnexion</button></li>
              </>
            ) : (
              <li className="nav-item"><Link className="btn btn-danger btn-sm mt-1" to="/connexion">Connexion</Link></li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
