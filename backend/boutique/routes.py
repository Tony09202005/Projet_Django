from django.urls import path

from .controllers import (
    auth_controller, avis_controller, commande_controller, dashboard_controller, favori_controller,
    paiement_controller, panier_controller, reference_controller, utilisateur_controller, vehicule_controller,
)

urlpatterns = [
    path("auth/register/", auth_controller.inscription),
    path("auth/login/", auth_controller.connexion),
    path("auth/logout/", auth_controller.deconnexion),
    path("auth/me/", auth_controller.profil),

    path("vehicules/", vehicule_controller.liste_vehicules),
    path("vehicules/<int:id>/", vehicule_controller.detail_vehicule),
    path("vehicules/<int:id>/avis/", avis_controller.ajouter_avis),
    path("marques/", reference_controller.liste_marques),
    path("marques/<int:id>/", reference_controller.detail_marque),
    path("categories/", reference_controller.liste_categories),
    path("categories/<int:id>/", reference_controller.detail_categorie),

    path("favoris/", favori_controller.liste_favoris),
    path("favoris/ajouter/", favori_controller.ajouter_favori),
    path("favoris/supprimer/<int:id>/", favori_controller.supprimer_favori),

    path("panier/", panier_controller.voir_panier),
    path("panier/ajouter/", panier_controller.ajouter_au_panier),
    path("panier/supprimer/<int:id>/", panier_controller.supprimer_du_panier),
    path("panier/vider/", panier_controller.vider_panier),

    path("commandes/", commande_controller.liste_commandes),
    path("commandes/<int:id>/", commande_controller.detail_commande),
    path("commandes/<int:id>/annuler/", commande_controller.annuler_commande),
    path("commandes/<int:id>/statut/", commande_controller.changer_statut_commande),

    path("paiements/", paiement_controller.liste_paiements),
    path("paiements/<int:id>/", paiement_controller.detail_paiement),
    path("paiements/<int:id>/payer/", paiement_controller.payer),
    path("paiements/<int:id>/confirmer/", paiement_controller.confirmer_paiement),

    path("avis/", avis_controller.liste_avis),
    path("avis/<int:id>/approuver/", avis_controller.approuver_avis),
    path("avis/<int:id>/", avis_controller.supprimer_avis),

    path("utilisateurs/", utilisateur_controller.liste_utilisateurs),
    path("utilisateurs/<int:id>/", utilisateur_controller.modifier_utilisateur),
    path("dashboard/statistiques/", dashboard_controller.statistiques),
]
