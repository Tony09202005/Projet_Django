import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../controllers/AuthController";
import { messageErreur } from "../../models/api";
import { authModel } from "../../models/authModel";

export default function Profil() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ prenom: user.prenom, nom: user.nom, telephone: user.telephone });

  function changer(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function enregistrer(e) {
    e.preventDefault();
    try {
      setUser(await authModel.modifierProfil(form));
      alert("Profil mis à jour.");
    } catch (err) {
      alert(messageErreur(err));
    }
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h2>Mon profil</h2>
      <form onSubmit={enregistrer}>
        <label>Prénom</label>
        <input className="form-control mb-2" name="prenom" value={form.prenom} onChange={changer} />
        <label>Nom</label>
        <input className="form-control mb-2" name="nom" value={form.nom} onChange={changer} />
        <label>Email</label>
        <input className="form-control mb-2" value={user.email} disabled />
        <label>Téléphone</label>
        <input className="form-control mb-3" name="telephone" value={form.telephone} onChange={changer} />
        <button className="btn btn-danger">Enregistrer</button>
      </form>
      {user.role === "CLIENT" && (
        <div className="mt-4">
          <Link to="/mes-commandes" className="btn btn-outline-dark me-2">Mes commandes</Link>
          <Link to="/favoris" className="btn btn-outline-dark me-2">Mes favoris</Link>
          <Link to="/panier" className="btn btn-outline-dark">Mon panier</Link>
        </div>
      )}
    </div>
  );
}
