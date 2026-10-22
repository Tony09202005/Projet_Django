import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePanier } from "../../controllers/PanierController";
import { METHODES, formatPrix } from "../../controllers/outils";
import { messageErreur } from "../../models/api";
import { commandeModel } from "../../models/commandeModel";

const FRAIS_LIVRAISON = 100;

export default function Commande() {
  const { panier, rafraichir } = usePanier();
  const navigate = useNavigate();
  const [mode, setMode] = useState("RETRAIT");
  const [adresse, setAdresse] = useState("");
  const [methode, setMethode] = useState("CARTE");
  const [envoi, setEnvoi] = useState(false);

  const frais = mode === "LIVRAISON" ? FRAIS_LIVRAISON : 0;

  async function valider(e) {
    e.preventDefault();
    setEnvoi(true);
    try {
      const commande = await commandeModel.creer({ mode_livraison: mode, adresse_livraison: adresse, methode_paiement: methode });
      rafraichir();
      navigate("/paiement/" + commande.paiements[0].id);
    } catch (err) {
      alert(messageErreur(err));
      rafraichir();
    }
    setEnvoi(false);
  }

  if (panier.articles.length === 0) {
    return <p>Votre panier est vide. <Link to="/vehicules">Voir les véhicules</Link></p>;
  }

  return (
    <div className="row">
      <div className="col-md-7">
        <h2>Passer la commande</h2>
        <form onSubmit={valider}>
          <h5>1. Livraison</h5>
          <div className="form-check">
            <input className="form-check-input" type="radio" id="retrait" checked={mode === "RETRAIT"} onChange={() => setMode("RETRAIT")} />
            <label className="form-check-label" htmlFor="retrait">Retrait en agence (gratuit)</label>
          </div>
          <div className="form-check mb-2">
            <input className="form-check-input" type="radio" id="livraison" checked={mode === "LIVRAISON"} onChange={() => setMode("LIVRAISON")} />
            <label className="form-check-label" htmlFor="livraison">Livraison à domicile (+ {formatPrix(FRAIS_LIVRAISON)})</label>
          </div>
          {mode === "LIVRAISON" && (
            <textarea className="form-control mb-3" placeholder="Adresse de livraison complète" value={adresse} onChange={(e) => setAdresse(e.target.value)} required />
          )}

          <h5 className="mt-3">2. Mode de paiement</h5>
          <select className="form-select mb-3" value={methode} onChange={(e) => setMethode(e.target.value)}>
            {METHODES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <p className="text-muted small">Le paiement se fait à l'étape suivante.</p>
          <button className="btn btn-danger" disabled={envoi}>{envoi ? "Envoi..." : "Valider la commande"}</button>
        </form>
      </div>

      <div className="col-md-5">
        <div className="card card-body">
          <h5>Récapitulatif</h5>
          {panier.articles.map((a) => (
            <div className="d-flex justify-content-between" key={a.id}>
              <span>{a.vehicule.marque_nom} {a.vehicule.modele}</span>
              <span>{formatPrix(a.prix)}</span>
            </div>
          ))}
          <hr />
          <div className="d-flex justify-content-between"><span>Sous-total</span><span>{formatPrix(panier.sous_total)}</span></div>
          <div className="d-flex justify-content-between"><span>Livraison</span><span>{formatPrix(frais)}</span></div>
          <hr />
          <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>{formatPrix(panier.sous_total + frais)}</span></div>
        </div>
      </div>
    </div>
  );
}
