import { categorieModel } from "../../../models/vehiculeModel";
import GestionReferentiel from "./GestionReferentiel";

export default function GestionCategories() {
  return <GestionReferentiel titre="Catégories" modele={categorieModel} />;
}
