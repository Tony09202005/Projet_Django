import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { messageErreur } from "../../models/api";
import { favoriModel } from "../../models/panierModel";
import VehiculeCarte from "../components/VehiculeCarte";

export default function Favoris() {
  const [favoris, setFavoris] = useState([]);

  function charger() {
    favoriModel.lister().then((d) => setFavoris(d.results));
  }

  useEffect(() => {
    charger();
  }, []);

  async function retirer(id) {
    try {
      await favoriModel.supprimer(id);
      charger();
    } catch (e) {
      alert(messageErreur(e));
    }
  }

  return (
    <div>
      <h2>Mes favoris</h2>
      {favoris.length === 0 && <p>Vous n'avez pas encore de favoris. <Link to="/vehicules">Voir les véhicules</Link></p>}
      <div className="row g-3">
        {favoris.map((f) => (
          <div className="col-md-3" key={f.id}>
            <VehiculeCarte vehicule={f.vehicule} />
            <button className="btn btn-sm btn-outline-secondary w-100 mt-1" onClick={() => retirer(f.id)}>Retirer des favoris</button>
          </div>
        ))}
      </div>
    </div>
  );
}
