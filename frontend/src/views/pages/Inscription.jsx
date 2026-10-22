import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthController";
import { messageErreur } from "../../models/api";

export default function Inscription() {
  const { inscription } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ prenom: "", nom: "", email: "", telephone: "", password: "", password_confirmation: "" });
  const [erreur, setErreur] = useState("");

  function changer(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function envoyer(e) {
    e.preventDefault();
    setErreur("");
    if (form.password !== form.password_confirmation) {
      setErreur("Les mots de passe ne sont pas identiques.");
      return;
    }
    try {
      await inscription(form);
      navigate("/");
    } catch (err) {
      setErreur(messageErreur(err));
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 480 }}>
      <h2 className="mb-3">Créer un compte</h2>
      {erreur && <div className="alert alert-danger">{erreur}</div>}
      <form onSubmit={envoyer}>
        <input className="form-control mb-3" name="prenom" placeholder="Prénom" value={form.prenom} onChange={changer} required />
        <input className="form-control mb-3" name="nom" placeholder="Nom" value={form.nom} onChange={changer} required />
        <input className="form-control mb-3" type="email" name="email" placeholder="Email" value={form.email} onChange={changer} required />
        <input className="form-control mb-3" name="telephone" placeholder="Téléphone" value={form.telephone} onChange={changer} />
        <input className="form-control mb-3" type="password" name="password" placeholder="Mot de passe (8 caractères minimum)" value={form.password} onChange={changer} required />
        <input className="form-control mb-3" type="password" name="password_confirmation" placeholder="Confirmer le mot de passe" value={form.password_confirmation} onChange={changer} required />
        <button className="btn btn-danger w-100">S'inscrire</button>
      </form>
      <p className="mt-3">Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
    </div>
  );
}
