import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../controllers/AuthController";
import { usePanier } from "../../controllers/PanierController";
import { STATUTS_VEHICULE, formatDate, formatPrix } from "../../controllers/outils";
import { messageErreur } from "../../models/api";
import { favoriModel, panierModel } from "../../models/panierModel";
import { vehiculeModel } from "../../models/vehiculeModel";

export default function DetailVehicule() {
  const { id } = useParams();
  const { user } = useAuth();
  const { setPanier } = usePanier();
  const navigate = useNavigate();
  const [vehicule, setVehicule] = useState(null);
  const [erreur, setErreur] = useState("");
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    vehiculeModel.detail(id).then(setVehicule).catch(() => setErreur("Véhicule introuvable."));
  }, [id]);

  async function ajouterAuPanier() {
    if (!user) return navigate("/connexion");
    try {
      setPanier(await panierModel.ajouter(vehicule.id));
      alert("Véhicule ajouté au panier.");
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  async function ajouterFavori() {
    if (!user) return navigate("/connexion");
    try {
      await favoriModel.ajouter(vehicule.id);
      alert("Ajouté aux favoris.");
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  async function envoyerAvis(e) {
    e.preventDefault();
    try {
      const r = await vehiculeModel.ajouterAvis(vehicule.id, { note: Number(note), commentaire: commentaire });
      alert(r.message);
      setCommentaire("");
    } catch (err) {
      alert(messageErreur(err));
    }
  }

  if (erreur) return <div className="alert alert-danger">{erreur} <Link to="/vehicules">Retour</Link></div>;
  if (!vehicule) return <p>Chargement...</p>;

  const disponible = vehicule.statut === "DISPONIBLE";
  const estClient = user && user.role === "CLIENT";

  return (
    <div>
      <Link to="/vehicules">&larr; Retour aux véhicules</Link>
      <div className="row mt-3">
        <div className="col-md-5">
          <div className="bg-light text-center py-5 rounded">
            <i className="bi bi-car-front" style={{ fontSize: "7rem" }}></i>
          </div>
        </div>
        <div className="col-md-7">
          <span className={"badge bg-" + STATUTS_VEHICULE[vehicule.statut]}>{vehicule.statut}</span>
          <h2>{vehicule.marque_nom} {vehicule.modele}</h2>
          <h3 className="text-danger">{formatPrix(vehicule.prix)}</h3>
          {vehicule.nombre_avis > 0 && <p>Note moyenne : {Number(vehicule.note_moyenne).toFixed(1)} / 5 ({vehicule.nombre_avis} avis)</p>}

          <table className="table table-sm">
            <tbody>
              <tr><th>Catégorie</th><td>{vehicule.categorie_nom}</td></tr>
              <tr><th>Année</th><td>{vehicule.annee}</td></tr>
              <tr><th>Kilométrage</th><td>{vehicule.kilometrage} km</td></tr>
              <tr><th>Carburant</th><td>{vehicule.type_carburant}</td></tr>
              <tr><th>Transmission</th><td>{vehicule.transmission}</td></tr>
              <tr><th>Couleur</th><td>{vehicule.couleur}</td></tr>
              <tr><th>Puissance</th><td>{vehicule.puissance} ch</td></tr>
              <tr><th>Portes / places</th><td>{vehicule.nombre_portes} / {vehicule.nombre_places}</td></tr>
              <tr><th>État</th><td>{vehicule.etat}</td></tr>
            </tbody>
          </table>

          {(!user || estClient) && (
            <div>
              <button className="btn btn-danger me-2" disabled={!disponible} onClick={ajouterAuPanier}>Ajouter au panier</button>
              <button className="btn btn-outline-danger" onClick={ajouterFavori}>Ajouter aux favoris</button>
              {!disponible && <p className="text-danger mt-2">Ce véhicule n'est plus disponible.</p>}
            </div>
          )}
        </div>
      </div>

      <h4 className="mt-4">Description</h4>
      <p>{vehicule.description || "Pas de description."}</p>

      <h4 className="mt-4">Avis</h4>
      {vehicule.avis.length === 0 && <p>Aucun avis pour le moment.</p>}
      {vehicule.avis.map((a) => (
        <div className="card mb-2" key={a.id}>
          <div className="card-body py-2">
            <strong>{a.auteur}</strong> - {a.note}/5 <small className="text-muted">({formatDate(a.date_creation)})</small>
            <p className="mb-0">{a.commentaire}</p>
          </div>
        </div>
      ))}

      {estClient && (
        <form className="card card-body mt-3" onSubmit={envoyerAvis}>
          <h5>Laisser un avis</h5>
          <select className="form-select mb-2 w-25" value={note} onChange={(e) => setNote(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
          </select>
          <textarea className="form-control mb-2" placeholder="Votre commentaire (facultatif)" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
          <button className="btn btn-dark align-self-start">Envoyer</button>
        </form>
      )}
    </div>
  );
}
