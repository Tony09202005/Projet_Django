import secrets
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from boutique.models import ArticleCommande, ArticlePanier, Commande, Paiement, Vehicule

from .outils import connexion_requise, erreur, est_admin, lire_json, paginer, repondre


class VehiculeIndisponible(Exception):
    pass


@connexion_requise
def liste_commandes(request):
    if request.method == "GET":
        return lister_commandes(request)
    if request.method == "POST":
        return creer_commande(request)
    return erreur("Méthode non autorisée.", 405)


def lister_commandes(request):
    commandes = Commande.objects.select_related("utilisateur")

    if not est_admin(request.utilisateur):
        commandes = commandes.filter(utilisateur=request.utilisateur)
    statut = request.GET.get("statut")
    if statut:
        commandes = commandes.filter(statut=statut)
    recherche = request.GET.get("search")
    if recherche:
        commandes = commandes.filter(reference__icontains=recherche) | commandes.filter(utilisateur__email__icontains=recherche)
    objets, infos = paginer(request, commandes.order_by("-date_creation", "-id"), 10)
    infos["results"] = [c.to_dict() for c in objets]
    return repondre(infos)


def creer_commande(request):
    utilisateur = request.utilisateur
    if utilisateur.role != "CLIENT":
        return erreur("Seuls les clients peuvent commander.", 403)
    data = lire_json(request) or {}

    mode = data.get("mode_livraison", "RETRAIT")
    methode = data.get("methode_paiement")
    adresse = (data.get("adresse_livraison") or "").strip()
    if mode not in ("LIVRAISON", "RETRAIT"):
        return erreur("Mode de livraison invalide.")
    if methode not in Paiement.METHODES:
        return erreur("Méthode de paiement invalide.")
    if mode == "LIVRAISON" and not adresse:
        return erreur("L'adresse de livraison est obligatoire.")

    try:
        with transaction.atomic():
            articles = list(ArticlePanier.objects.filter(panier__utilisateur=utilisateur).select_related("vehicule"))
            if not articles:
                return erreur("Votre panier est vide.")

            sous_total = Decimal("0")
            for article in articles:
                modifies = Vehicule.objects.filter(pk=article.vehicule_id, statut="DISPONIBLE").update(statut="RESERVE")
                if modifies == 0:
                    raise VehiculeIndisponible(str(article.vehicule))
                sous_total += article.vehicule.prix

            frais = Decimal(settings.FRAIS_LIVRAISON) if mode == "LIVRAISON" else Decimal("0")
            commande = Commande.objects.create(
                utilisateur=utilisateur,
                reference="CMD-" + timezone.now().strftime("%Y%m%d") + "-" + secrets.token_hex(3).upper(),
                sous_total=sous_total, frais_livraison=frais, total=sous_total + frais,
                mode_livraison=mode, adresse_livraison=adresse if mode == "LIVRAISON" else "",
            )
            for article in articles:
                ArticleCommande.objects.create(commande=commande, vehicule=article.vehicule, prix=article.vehicule.prix)

            Paiement.objects.create(
                commande=commande, reference="PAY-" + secrets.token_hex(4).upper(),
                methode=methode, montant=commande.total,
            )
            ArticlePanier.objects.filter(panier__utilisateur=utilisateur).delete()
    except VehiculeIndisponible as e:
        return erreur("Le véhicule " + str(e) + " n'est plus disponible.", 409)

    return repondre(commande.to_dict(), 201)


@connexion_requise
def detail_commande(request, id):
    commande = Commande.objects.select_related("utilisateur").filter(pk=id).first()
    if commande is None or (commande.utilisateur_id != request.utilisateur.id and not est_admin(request.utilisateur)):
        return erreur("Commande introuvable.", 404)
    return repondre(commande.to_dict())


def liberer_vehicules(commande):
    ids = list(commande.articles.values_list("vehicule_id", flat=True))
    Vehicule.objects.filter(pk__in=ids, statut__in=["RESERVE", "VENDU"]).update(statut="DISPONIBLE")


@connexion_requise
def annuler_commande(request, id):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    commande = Commande.objects.select_related("utilisateur").filter(pk=id).first()
    if commande is None or (commande.utilisateur_id != request.utilisateur.id and not est_admin(request.utilisateur)):
        return erreur("Commande introuvable.", 404)

    if commande.statut in ("ANNULEE", "REMBOURSEE"):
        return erreur("Cette commande est déjà annulée.", 409)
    if commande.statut == "TERMINEE":
        return erreur("Une commande terminée ne peut plus être annulée.", 409)

    paye = commande.paiements.filter(statut="REUSSI").exists()
    if paye and not est_admin(request.utilisateur):
        return erreur("Cette commande est déjà payée : contactez l'agence pour l'annuler.", 409)

    with transaction.atomic():
        liberer_vehicules(commande)
        if paye:
            commande.paiements.filter(statut="REUSSI").update(statut="REMBOURSE")
            commande.statut = "REMBOURSEE"
        else:
            commande.paiements.filter(statut="EN_ATTENTE").update(statut="ECHOUE")
            commande.statut = "ANNULEE"
        commande.save()
    return repondre(commande.to_dict())


SUITE = {"CONFIRMEE": "EN_PREPARATION", "EN_PREPARATION": "PRETE", "PRETE": "TERMINEE"}


@connexion_requise
def changer_statut_commande(request, id):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    if not est_admin(request.utilisateur):
        return erreur("Réservé aux administrateurs.", 403)
    commande = Commande.objects.select_related("utilisateur").filter(pk=id).first()
    if commande is None:
        return erreur("Commande introuvable.", 404)
    data = lire_json(request) or {}
    if SUITE.get(commande.statut) != data.get("statut"):
        return erreur("Changement de statut impossible depuis " + commande.statut + ".", 409)
    commande.statut = data["statut"]
    commande.save()
    return repondre(commande.to_dict())
