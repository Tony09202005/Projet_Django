import { useEffect, useState } from "react";
import { CARBURANTS, ETATS, STATUTS_VEHICULE, STATUTS_VEHICULE_LISTE, TRANSMISSIONS, formatPrix } from "../../../controllers/outils";
import { messageErreur } from "../../../models/api";
import { categorieModel, marqueModel, vehiculeModel } from "../../../models/vehiculeModel";
import Pagination from "../../components/Pagination";

const VIDE = {
  marque: "", categorie: "", modele: "", annee: 2023, prix: "", kilometrage: 0, type_carburant: "ESSENCE",
  transmission: "MANUELLE", couleur: "", puissance: "", nombre_portes: 4, nombre_places: 5,
  etat: "OCCASION", statut: "DISPONIBLE", description: "",
};

export default function GestionVehicules() {
  const [donnees, setDonnees] = useState(null);
  const [page, setPage] = useState(1);
  const [recherche, setRecherche] = useState("");
  const [marques, setMarques] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [idEnCours, setIdEnCours] = useState(null);

  function charger() {
    vehiculeModel.lister({ page: page, taille: 10, search: recherche }).then(setDonnees);
  }

  useEffect(() => {
    charger();
  }, [page, recherche]);

  useEffect(() => {
    marqueModel.lister().then((d) => setMarques(d.results));
    categorieModel.lister().then((d) => setCategories(d.results));
  }, []);

  function changer(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function nouveau() {
    setForm({ ...VIDE });
    setIdEnCours(null);
  }

  function modifier(v) {
    vehiculeModel.detail(v.id).then((detail) => {
      setForm({ ...detail });
      setIdEnCours(v.id);
    });
  }

  async function enregistrer(e) {
    e.preventDefault();
    try {
      if (idEnCours) {
        await vehiculeModel.modifier(idEnCours, form);
      } else {
        await vehiculeModel.creer(form);
      }
      setForm(null);
      charger();
    } catch (err) {
      alert(messageErreur(err));
    }
  }

  async function supprimer(v) {
    if (!window.confirm("Supprimer " + v.marque_nom + " " + v.modele + " ?")) return;
    try {
      await vehiculeModel.supprimer(v.id);
      charger();
    } catch (err) {
      alert(messageErreur(err));
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>Véhicules</h2>
        <button className="btn btn-danger" onClick={nouveau}>+ Ajouter un véhicule</button>
      </div>

      {form && (
        <form className="card card-body mb-4" onSubmit={enregistrer}>
          <h5>{idEnCours ? "Modifier le véhicule" : "Nouveau véhicule"}</h5>
          <div className="row">
            <div className="col-md-4 mb-2">
              <label>Marque</label>
              <select className="form-select" name="marque" value={form.marque} onChange={changer} required>
                <option value="">-- choisir --</option>
                {marques.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
            <div className="col-md-4 mb-2">
              <label>Catégorie</label>
              <select className="form-select" name="categorie" value={form.categorie} onChange={changer} required>
                <option value="">-- choisir --</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="col-md-4 mb-2"><label>Modèle</label><input className="form-control" name="modele" value={form.modele} onChange={changer} required /></div>
            <div className="col-md-3 mb-2"><label>Année</label><input className="form-control" type="number" name="annee" value={form.annee} onChange={changer} required /></div>
            <div className="col-md-3 mb-2"><label>Prix</label><input className="form-control" type="number" name="prix" value={form.prix} onChange={changer} required /></div>
            <div className="col-md-3 mb-2"><label>Kilométrage</label><input className="form-control" type="number" name="kilometrage" value={form.kilometrage} onChange={changer} /></div>
            <div className="col-md-3 mb-2"><label>Puissance (ch)</label><input className="form-control" type="number" name="puissance" value={form.puissance} onChange={changer} required /></div>
            <div className="col-md-3 mb-2">
              <label>Carburant</label>
              <select className="form-select" name="type_carburant" value={form.type_carburant} onChange={changer}>
                {CARBURANTS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3 mb-2">
              <label>Transmission</label>
              <select className="form-select" name="transmission" value={form.transmission} onChange={changer}>
                {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-md-3 mb-2"><label>Couleur</label><input className="form-control" name="couleur" value={form.couleur} onChange={changer} required /></div>
            <div className="col-md-3 mb-2">
              <label>État</label>
              <select className="form-select" name="etat" value={form.etat} onChange={changer}>
                {ETATS.map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="col-md-3 mb-2"><label>Portes</label><input className="form-control" type="number" name="nombre_portes" value={form.nombre_portes} onChange={changer} /></div>
            <div className="col-md-3 mb-2"><label>Places</label><input className="form-control" type="number" name="nombre_places" value={form.nombre_places} onChange={changer} /></div>
            <div className="col-md-3 mb-2">
              <label>Statut</label>
              <select className="form-select" name="statut" value={form.statut} onChange={changer}>
                {STATUTS_VEHICULE_LISTE.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-12 mb-2"><label>Description</label><textarea className="form-control" name="description" value={form.description} onChange={changer} /></div>
          </div>
          <div>
            <button className="btn btn-danger me-2">Enregistrer</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>Annuler</button>
          </div>
        </form>
      )}

      <input className="form-control mb-3 w-50" placeholder="Rechercher..." value={recherche} onChange={(e) => { setRecherche(e.target.value); setPage(1); }} />

      {!donnees ? <p>Chargement...</p> : (
        <>
          <table className="table table-hover">
            <thead><tr><th>Véhicule</th><th>Année</th><th>Prix</th><th>Statut</th><th>Vues</th><th></th></tr></thead>
            <tbody>
              {donnees.results.map((v) => (
                <tr key={v.id}>
                  <td>{v.marque_nom} {v.modele}<br /><small className="text-muted">{v.categorie_nom}</small></td>
                  <td>{v.annee}</td>
                  <td>{formatPrix(v.prix)}</td>
                  <td><span className={"badge bg-" + STATUTS_VEHICULE[v.statut]}>{v.statut}</span></td>
                  <td>{v.nombre_vues}</td>
                  <td className="text-end">
                    <button className="btn btn-sm btn-outline-dark me-1" onClick={() => modifier(v)}>Modifier</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => supprimer(v)}>Supprimer</button>
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
