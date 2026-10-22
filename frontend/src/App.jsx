import { Outlet, Route, Routes } from "react-router-dom";
import RouteProtegee from "./controllers/RouteProtegee";
import AdminLayout from "./views/components/AdminLayout";
import Navbar from "./views/components/Navbar";
import Accueil from "./views/pages/Accueil";
import Catalogue from "./views/pages/Catalogue";
import Commande from "./views/pages/Commande";
import Connexion from "./views/pages/Connexion";
import DetailCommande from "./views/pages/DetailCommande";
import DetailVehicule from "./views/pages/DetailVehicule";
import Favoris from "./views/pages/Favoris";
import Inscription from "./views/pages/Inscription";
import MesCommandes from "./views/pages/MesCommandes";
import Paiement from "./views/pages/Paiement";
import Panier from "./views/pages/Panier";
import Profil from "./views/pages/Profil";
import Dashboard from "./views/pages/admin/Dashboard";
import GestionAvis from "./views/pages/admin/GestionAvis";
import GestionCategories from "./views/pages/admin/GestionCategories";
import GestionCommandes from "./views/pages/admin/GestionCommandes";
import GestionMarques from "./views/pages/admin/GestionMarques";
import GestionPaiements from "./views/pages/admin/GestionPaiements";
import GestionUtilisateurs from "./views/pages/admin/GestionUtilisateurs";
import GestionVehicules from "./views/pages/admin/GestionVehicules";

function Page() {
  return (
    <>
      <Navbar />
      <div className="container py-4"><Outlet /></div>
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Page />}>
        <Route path="/" element={<Accueil />} />
        <Route path="/vehicules" element={<Catalogue />} />
        <Route path="/vehicules/:id" element={<DetailVehicule />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/profil" element={<RouteProtegee><Profil /></RouteProtegee>} />
        <Route path="/favoris" element={<RouteProtegee role="CLIENT"><Favoris /></RouteProtegee>} />
        <Route path="/panier" element={<RouteProtegee role="CLIENT"><Panier /></RouteProtegee>} />
        <Route path="/commande" element={<RouteProtegee role="CLIENT"><Commande /></RouteProtegee>} />
        <Route path="/mes-commandes" element={<RouteProtegee role="CLIENT"><MesCommandes /></RouteProtegee>} />
        <Route path="/mes-commandes/:id" element={<RouteProtegee role="CLIENT"><DetailCommande /></RouteProtegee>} />
        <Route path="/paiement/:id" element={<RouteProtegee role="CLIENT"><Paiement /></RouteProtegee>} />
        <Route path="*" element={<h2 className="text-center">Page introuvable</h2>} />
      </Route>

      <Route path="/admin" element={<><Navbar /><RouteProtegee role="ADMIN"><AdminLayout /></RouteProtegee></>}>
        <Route index element={<Dashboard />} />
        <Route path="vehicules" element={<GestionVehicules />} />
        <Route path="marques" element={<GestionMarques />} />
        <Route path="categories" element={<GestionCategories />} />
        <Route path="commandes" element={<GestionCommandes />} />
        <Route path="paiements" element={<GestionPaiements />} />
        <Route path="avis" element={<GestionAvis />} />
        <Route path="utilisateurs" element={<GestionUtilisateurs />} />
      </Route>
    </Routes>
  );
}
