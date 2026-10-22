import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthController";
import { STATUTS_VEHICULE, formatPrix } from "../../controllers/outils";
import { favoriModel } from "../../models/panierModel";
import { messageErreur } from "../../models/api";

export default function VehiculeCarte({ vehicule }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function ajouterFavori() {
    if (!user) {
      navigate("/connexion");
      return;
    }
    try {
      await favoriModel.ajouter(vehicule.id);
      alert("Ajouté aux favoris !");
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  return (
    <div className="card h-100 shadow-sm">
      <div className="bg-light text-center py-4">
        <i className="bi bi-car-front display-3 text-secondary"></i>
      </div>
      <div className="card-body">
        <span className={"badge bg-" + STATUTS_VEHICULE[vehicule.statut]}>{vehicule.statut}</span>
        <h5 className="card-title mt-2">{vehicule.marque_nom} {vehicule.modele}</h5>
        <p className="fw-bold text-danger mb-1">{formatPrix(vehicule.prix)}</p>
        <p className="text-muted small mb-2">
          {vehicule.annee} - {vehicule.kilometrage} km<br />
          {vehicule.type_carburant} - {vehicule.transmission}
        </p>
        <Link to={"/vehicules/" + vehicule.id} className="btn btn-outline-dark btn-sm me-2">Détails</Link>
        {(!user || user.role === "CLIENT") && (
          <button className="btn btn-outline-danger btn-sm" onClick={ajouterFavori}>
            <i className="bi bi-heart"></i>
          </button>
        )}
      </div>
    </div>
  );
}
