import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../controllers/AuthController";
import { messageErreur } from "../../models/api";

export default function Connexion() {
  const { connexion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  async function envoyer(e) {
    e.preventDefault();
    setErreur("");
    try {
      const user = await connexion(email, password);
      navigate(user.role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      setErreur(messageErreur(err));
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 420 }}>
      <h2 className="mb-3">Connexion</h2>
      {erreur && <div className="alert alert-danger">{erreur}</div>}
      <form onSubmit={envoyer}>
        <input className="form-control mb-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="form-control mb-3" type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn btn-danger w-100">Se connecter</button>
      </form>
      <p className="mt-3">Pas de compte ? <Link to="/inscription">S'inscrire</Link></p>
    </div>
  );
}
