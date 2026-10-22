import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STATUTS_COMMANDE, formatPrix } from "../../../controllers/outils";
import { adminModel } from "../../../models/adminModel";

const COULEURS = ["#dc3545", "#212529", "#0d6efd", "#198754", "#ffc107", "#6f42c1", "#0dcaf0", "#fd7e14", "#6c757d", "#20c997"];

function Carte({ titre, valeur, petit }) {
  return (
    <div className="col-md-3 mb-3">
      <div className="card h-100"><div className="card-body">
        <div className="text-muted">{titre}</div>
        <h3>{valeur}</h3>
        <small className="text-muted">{petit}</small>
      </div></div>
    </div>
  );
}

export default function Dashboard() {
  const [s, setS] = useState(null);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    adminModel.statistiques().then(setS).catch(() => setErreur("Impossible de charger les statistiques."));
  }, []);

  if (erreur) return <div className="alert alert-danger">{erreur}</div>;
  if (!s) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Tableau de bord</h2>
      <div className="row mt-3">
        <Carte titre="Ventes" valeur={s.vehicules_vendus} petit="véhicules vendus" />
        <Carte titre="Commandes" valeur={s.nombre_commandes} petit={s.commandes_en_attente + " en attente"} />
        <Carte titre="Clients" valeur={s.nombre_clients} />
        <Carte titre="Véhicules" valeur={s.total_vehicules} petit={s.vehicules_disponibles + " dispo, " + s.vehicules_reserves + " réservés"} />
        <Carte titre="Revenus" valeur={formatPrix(s.chiffre_affaires)} petit={s.paiements_reussis + " paiements réussis, " + s.paiements_echoues + " échoués"} />
        <Carte titre="Commandes terminées" valeur={s.commandes_terminees} />
      </div>

      <div className="row mt-2">
        <div className="col-md-6 mb-4">
          <h5>Ventes par mois</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={s.ventes_par_mois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="valeur" name="Véhicules vendus" fill="#dc3545" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6 mb-4">
          <h5>Chiffre d'affaires par mois</h5>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={s.revenus_par_mois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valeur" name="Revenus" stroke="#212529" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6 mb-4">
          <h5>Commandes par mois</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={s.commandes_par_mois}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mois" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="valeur" name="Commandes" fill="#212529" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-md-6 mb-4">
          <h5>Véhicules par marque</h5>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={s.repartition_marques} dataKey="valeur" nameKey="nom" outerRadius={90}>
                {s.repartition_marques.map((m, i) => <Cell key={m.nom} fill={COULEURS[i % COULEURS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <h5>Véhicules les plus consultés</h5>
          <ul className="list-group mb-3">
            {s.plus_consultes.map((v) => (
              <li className="list-group-item d-flex justify-content-between" key={v.id}>{v.libelle}<span className="badge bg-secondary">{v.vues} vues</span></li>
            ))}
          </ul>
        </div>
        <div className="col-md-6">
          <h5>Dernières commandes</h5>
          <ul className="list-group">
            {s.commandes_recentes.map((c) => (
              <li className="list-group-item d-flex justify-content-between" key={c.id}>
                <span>{c.reference}<br /><small className="text-muted">{c.client}</small></span>
                <span>{formatPrix(c.total)} <span className={"badge bg-" + STATUTS_COMMANDE[c.statut]}>{c.statut}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
