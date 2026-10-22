import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CARBURANTS, ETATS, TRANSMISSIONS } from "../../controllers/outils";
import { categorieModel, marqueModel, vehiculeModel } from "../../models/vehiculeModel";
import Pagination from "../components/Pagination";
import VehiculeCarte from "../components/VehiculeCarte";

const FILTRES_VIDES = {
  search: "", marque: "", categorie: "", prix_min: "", prix_max: "", annee_min: "", annee_max: "",
  kilometrage_max: "", type_carburant: "", transmission: "", etat: "", ordering: "-date_creation",
};

export default function Catalogue() {
  const [searchParams] = useSearchParams();
  const [filtres, setFiltres] = useState({ ...FILTRES_VIDES });
  const [appliques, setAppliques] = useState({ ...FILTRES_VIDES });
  const [page, setPage] = useState(1);
  const [donnees, setDonnees] = useState(null);
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    marqueModel.lister().then((d) => setMarques(d.results));
    categorieModel.lister().then((d) => setCategories(d.results));
  }, []);

  useEffect(() => {
    const depuisUrl = {
      ...FILTRES_VIDES,
      search: searchParams.get("search") || "",
      marque: searchParams.get("marque") || "",
      categorie: searchParams.get("categorie") || "",
    };
    setFiltres(depuisUrl);
    setAppliques(depuisUrl);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const params = { page: page, taille: 12 };
    for (const cle in appliques) {
      if (appliques[cle] !== "") params[cle] = appliques[cle];
    }
    setErreur("");
    vehiculeModel.lister(params).then(setDonnees).catch(() => setErreur("Impossible de charger les véhicules."));
  }, [appliques, page]);

  function changer(e) {
    setFiltres({ ...filtres, [e.target.name]: e.target.value });
  }

  function rechercher(e) {
    e.preventDefault();
    setAppliques({ ...filtres });
    setPage(1);
  }

  function reinitialiser() {
    setFiltres({ ...FILTRES_VIDES });
    setAppliques({ ...FILTRES_VIDES });
    setPage(1);
  }

  return (
    <div className="row">
      <div className="col-md-3">
        <form onSubmit={rechercher} className="card card-body mb-3">
          <h5>Filtres</h5>
          <input className="form-control mb-2" name="search" placeholder="Recherche" value={filtres.search} onChange={changer} />
          <select className="form-select mb-2" name="marque" value={filtres.marque} onChange={changer}>
            <option value="">Toutes les marques</option>
            {marques.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
          <select className="form-select mb-2" name="categorie" value={filtres.categorie} onChange={changer}>
            <option value="">Toutes les catégories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <div className="d-flex gap-2 mb-2">
            <input className="form-control" type="number" name="prix_min" placeholder="Prix min" value={filtres.prix_min} onChange={changer} />
            <input className="form-control" type="number" name="prix_max" placeholder="Prix max" value={filtres.prix_max} onChange={changer} />
          </div>
          <div className="d-flex gap-2 mb-2">
            <input className="form-control" type="number" name="annee_min" placeholder="Année min" value={filtres.annee_min} onChange={changer} />
            <input className="form-control" type="number" name="annee_max" placeholder="Année max" value={filtres.annee_max} onChange={changer} />
          </div>
          <input className="form-control mb-2" type="number" name="kilometrage_max" placeholder="Kilométrage max" value={filtres.kilometrage_max} onChange={changer} />
          <select className="form-select mb-2" name="type_carburant" value={filtres.type_carburant} onChange={changer}>
            <option value="">Carburant</option>
            {CARBURANTS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-select mb-2" name="transmission" value={filtres.transmission} onChange={changer}>
            <option value="">Transmission</option>
            {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select mb-2" name="etat" value={filtres.etat} onChange={changer}>
            <option value="">État</option>
            {ETATS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="form-select mb-3" name="ordering" value={filtres.ordering} onChange={changer}>
            <option value="-date_creation">Plus récents</option>
            <option value="prix">Prix croissant</option>
            <option value="-prix">Prix décroissant</option>
            <option value="-annee">Année récente</option>
            <option value="kilometrage">Kilométrage faible</option>
          </select>
          <button className="btn btn-danger mb-2">Rechercher</button>
          <button type="button" className="btn btn-outline-secondary" onClick={reinitialiser}>Réinitialiser</button>
        </form>
      </div>

      <div className="col-md-9">
        <h3>Nos véhicules {donnees && <small className="text-muted">({donnees.count})</small>}</h3>
        {erreur && <div className="alert alert-danger">{erreur}</div>}
        {!donnees && !erreur && <p>Chargement...</p>}
        {donnees && donnees.results.length === 0 && <p>Aucun véhicule trouvé.</p>}
        <div className="row g-3">
          {donnees && donnees.results.map((v) => (
            <div className="col-md-4" key={v.id}><VehiculeCarte vehicule={v} /></div>
          ))}
        </div>
        {donnees && <Pagination page={donnees.page} pages={donnees.pages} onChange={setPage} />}
      </div>
    </div>
  );
}
