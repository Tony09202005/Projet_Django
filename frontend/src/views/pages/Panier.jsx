import { Link, useNavigate } from "react-router-dom";
import { usePanier } from "../../controllers/PanierController";
import { formatPrix } from "../../controllers/outils";
import { messageErreur } from "../../models/api";
import { panierModel } from "../../models/panierModel";

export default function Panier() {
  const { panier, setPanier } = usePanier();
  const navigate = useNavigate();
  const indisponibles = panier.articles.filter((a) => !a.disponible);

  async function supprimer(id) {
    try {
      setPanier(await panierModel.supprimer(id));
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  async function vider() {
    if (!window.confirm("Vider le panier ?")) return;
    setPanier(await panierModel.vider());
  }

  if (panier.articles.length === 0) {
    return <div><h2>Mon panier</h2><p>Votre panier est vide. <Link to="/vehicules">Voir les véhicules</Link></p></div>;
  }

  return (
    <div>
      <h2>Mon panier</h2>
      <table className="table">
        <thead><tr><th>Véhicule</th><th>Année</th><th>Prix</th><th></th></tr></thead>
        <tbody>
          {panier.articles.map((a) => (
            <tr key={a.id}>
              <td>
                {a.vehicule.marque_nom} {a.vehicule.modele}
                {!a.disponible && <span className="badge bg-danger ms-2">Plus disponible</span>}
              </td>
              <td>{a.vehicule.annee}</td>
              <td>{formatPrix(a.prix)}</td>
              <td><button className="btn btn-sm btn-outline-danger" onClick={() => supprimer(a.id)}>Supprimer</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>Sous-total : <strong>{formatPrix(panier.sous_total)}</strong></p>
      <p className="text-muted">Les frais de livraison sont calculés à l'étape suivante.</p>
      <button className="btn btn-outline-secondary me-2" onClick={vider}>Vider le panier</button>
      <button className="btn btn-danger" disabled={indisponibles.length > 0} onClick={() => navigate("/commande")}>Passer la commande</button>
      {indisponibles.length > 0 && <p className="text-danger mt-2">Retirez les véhicules indisponibles pour continuer.</p>}
    </div>
  );
}
