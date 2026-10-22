import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthController";

export default function RouteProtegee({ role, children }) {
  const { user, chargement } = useAuth();

  if (chargement) {
    return <p className="text-center mt-5">Chargement...</p>;
  }
  if (!user) {
    return <Navigate to="/connexion" replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  }
  return children;
}
