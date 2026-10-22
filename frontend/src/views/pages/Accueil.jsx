import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categorieModel, marqueModel, vehiculeModel } from "../../models/vehiculeModel";
import VehiculeCarte from "../components/VehiculeCarte";

export default function Accueil() {
  const navigate = useNavigate();
  const [recherche, setRecherche] = useState("");
  const [recents, setRecents] = useState([]);
  const [populaires, setPopulaires] = useState([]);
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    vehiculeModel.lister({ ordering: "-date_creation", taille: 4, statut: "DISPONIBLE" }).then((d) => setRecents(d.results));
    vehiculeModel.lister({ ordering: "-nombre_vues", taille: 4, statut: "DISPONIBLE" }).then((d) => setPopulaires(d.results));
    marqueModel.lister().then((d) => setMarques(d.results));
    categorieModel.lister().then((d) => setCategories(d.results));
  }, []);

  function chercher(e) {
    e.preventDefault();
    navigate("/vehicules?search=" + encodeURIComponent(recherche));
  }

  return (
    <div>
      <div className="bg-dark text-white text-center p-5 rounded mb-4">
        <h1>Trouvez le véhicule qui vous correspond</h1>
        <p>Des véhicules neufs et d'occasion, vérifiés et prêts à rouler.</p>
        <form className="d-flex justify-content-center gap-2 mb-3" onSubmit={chercher}>
          <input className="form-control w-50" placeholder="Marque, modèle..." value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          <button className="btn btn-danger">Rechercher</button>
        </form>
        <Link to="/vehicules" className="btn btn-outline-light">Voir les véhicules</Link>
      </div>

      <h3>Véhicules populaires</h3>
      <div className="row g-3 mb-4">
        {populaires.map((v) => <div className="col-md-3" key={v.id}><VehiculeCarte vehicule={v} /></div>)}
      </div>

      <h3>Derniers arrivages</h3>
      <div className="row g-3 mb-4">
        {recents.map((v) => <div className="col-md-3" key={v.id}><VehiculeCarte vehicule={v} /></div>)}
      </div>

      <h3>Nos marques</h3>
      <div className="mb-4">
        {marques.map((m) => (
          <Link key={m.id} to={"/vehicules?marque=" + m.id} className="btn btn-outline-secondary me-2 mb-2">
            {m.nom} ({m.nombre_vehicules})
          </Link>
        ))}
      </div>

      <h3>Catégories</h3>
      <div className="mb-4">
        {categories.map((c) => (
          <Link key={c.id} to={"/vehicules?categorie=" + c.id} className="btn btn-outline-dark me-2 mb-2">
            {c.nom} ({c.nombre_vehicules})
          </Link>
        ))}
      </div>

      <div className="row text-center mb-4">
        <div className="col-md-4"><i className="bi bi-shield-check fs-1 text-danger"></i><h5>Véhicules contrôlés</h5></div>
        <div className="col-md-4"><i className="bi bi-cash-coin fs-1 text-danger"></i><h5>Prix transparents</h5></div>
        <div className="col-md-4"><i className="bi bi-truck fs-1 text-danger"></i><h5>Livraison ou retrait</h5></div>
      </div>

      <div className="bg-light text-center p-4 rounded">
        <h4>Prêt à prendre la route ?</h4>
        <Link to="/inscription" className="btn btn-danger">Créer un compte</Link>
      </div>
    </div>
  );
}
