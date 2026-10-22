import { useEffect, useState } from "react";
import { messageErreur } from "../../../models/api";

export default function GestionReferentiel({ titre, modele }) {
  const [liste, setListe] = useState([]);
  const [form, setForm] = useState(null);
  const [idEnCours, setIdEnCours] = useState(null);

  function charger() {
    modele.lister().then((d) => setListe(d.results));
  }

  useEffect(() => {
    charger();
  }, []);

  function nouveau() {
    setForm({ nom: "", description: "", est_active: true });
    setIdEnCours(null);
  }

  function modifier(element) {
    setForm({ nom: element.nom, description: element.description, est_active: element.est_active });
    setIdEnCours(element.id);
  }

  async function enregistrer(e) {
    e.preventDefault();
    try {
      if (idEnCours) {
        await modele.modifier(idEnCours, form);
      } else {
        await modele.creer(form);
      }
      setForm(null);
      charger();
    } catch (err) {
      alert(messageErreur(err));
    }
  }

  async function supprimer(element) {
    if (!window.confirm("Supprimer " + element.nom + " ?")) return;
    try {
      await modele.supprimer(element.id);
      charger();
    } catch (err) {
      alert(messageErreur(err));
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h2>{titre}</h2>
        <button className="btn btn-danger" onClick={nouveau}>+ Ajouter</button>
      </div>

      {form && (
        <form className="card card-body mb-4" onSubmit={enregistrer}>
          <input className="form-control mb-2" placeholder="Nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
          <textarea className="form-control mb-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="active" checked={form.est_active} onChange={(e) => setForm({ ...form, est_active: e.target.checked })} />
            <label className="form-check-label" htmlFor="active">Active</label>
          </div>
          <div>
            <button className="btn btn-danger me-2">Enregistrer</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => setForm(null)}>Annuler</button>
          </div>
        </form>
      )}

      <table className="table table-hover">
        <thead><tr><th>Nom</th><th>Description</th><th>Disponibles</th><th>Active</th><th></th></tr></thead>
        <tbody>
          {liste.map((e) => (
            <tr key={e.id}>
              <td>{e.nom}</td>
              <td>{e.description}</td>
              <td>{e.nombre_vehicules}</td>
              <td>{e.est_active ? "Oui" : "Non"}</td>
              <td className="text-end">
                <button className="btn btn-sm btn-outline-dark me-1" onClick={() => modifier(e)}>Modifier</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => supprimer(e)}>Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
