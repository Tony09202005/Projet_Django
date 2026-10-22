import { marqueModel } from "../../../models/vehiculeModel";
import GestionReferentiel from "./GestionReferentiel";

export default function GestionMarques() {
  return <GestionReferentiel titre="Marques" modele={marqueModel} />;
}
