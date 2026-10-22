import secrets

from django.db import transaction
from django.utils import timezone

from boutique.models import Paiement, Vehicule

from .outils import admin_requis, client_requis, connexion_requise, erreur, est_admin, lire_json, paginer, repondre


@connexion_requise
def liste_paiements(request):
    paiements = Paiement.objects.select_related("commande")
    if not est_admin(request.utilisateur):
        paiements = paiements.filter(commande__utilisateur=request.utilisateur)
    statut = request.GET.get("statut")
    if statut:
        paiements = paiements.filter(statut=statut)
    objets, infos = paginer(request, paiements.order_by("-date_creation", "-id"), 10)
    infos["results"] = [p.to_dict() for p in objets]
    return repondre(infos)


@connexion_requise
def detail_paiement(request, id):
    paiement = Paiement.objects.select_related("commande").filter(pk=id).first()
    if paiement is None or (paiement.commande.utilisateur_id != request.utilisateur.id and not est_admin(request.utilisateur)):
        return erreur("Paiement introuvable.", 404)
    return repondre(paiement.to_dict())


def valider_paiement(paiement):
    """Paiement réussi : la commande est confirmée et les véhicules sont vendus."""
    paiement.statut = "REUSSI"
    paiement.date_paiement = timezone.now()
    paiement.save()
    commande = paiement.commande
    commande.statut = "CONFIRMEE"
    commande.save()
    ids = list(commande.articles.values_list("vehicule_id", flat=True))
    Vehicule.objects.filter(pk__in=ids, statut="RESERVE").update(statut="VENDU")


@client_requis
def payer(request, id):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    paiement = Paiement.objects.select_related("commande").filter(pk=id).first()
    if paiement is None or paiement.commande.utilisateur_id != request.utilisateur.id:
        return erreur("Paiement introuvable.", 404)
    if paiement.statut in ("REUSSI", "REMBOURSE"):
        return erreur("Ce paiement est déjà réglé.", 409)
    if paiement.commande.statut != "EN_ATTENTE":
        return erreur("Cette commande n'est plus en attente de paiement.", 409)

    data = lire_json(request) or {}
    methode = data.get("methode") or paiement.methode
    if methode not in Paiement.METHODES:
        return erreur("Méthode de paiement invalide.")

    message = ""
    reussi = False
    en_attente = False

    if methode == "CARTE":
        numero = "".join(c for c in str(data.get("numero_carte", "")) if c.isdigit())
        if len(numero) < 12:
            return erreur("Numéro de carte invalide.", 400, {"numero_carte": "Numéro de carte invalide."})
        reussi = not numero.endswith("0000")
        message = "Paiement accepté (simulation)." if reussi else "Carte refusée (simulation)."
    elif methode == "MOBILE_MONEY":
        numero = "".join(c for c in str(data.get("numero_telephone", "")) if c.isdigit())
        if len(numero) < 8:
            return erreur("Numéro de téléphone invalide.", 400, {"numero_telephone": "Numéro invalide."})
        reussi = not numero.endswith("0000")
        message = "Paiement accepté (simulation)." if reussi else "Transaction refusée (simulation)."
    else:
        en_attente = True
        message = "Paiement enregistré, en attente de validation par l'agence."

    with transaction.atomic():
        paiement.methode = methode
        if reussi:
            paiement.identifiant_transaction = "SIM-" + secrets.token_hex(5).upper()
            valider_paiement(paiement)
        elif en_attente:
            paiement.statut = "EN_ATTENTE"
            paiement.save()
        else:
            paiement.statut = "ECHOUE"
            paiement.save()

    resultat = paiement.to_dict()
    resultat["message"] = message
    return repondre(resultat)


@admin_requis
def confirmer_paiement(request, id):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    paiement = Paiement.objects.select_related("commande").filter(pk=id).first()
    if paiement is None:
        return erreur("Paiement introuvable.", 404)
    if paiement.statut != "EN_ATTENTE" or paiement.commande.statut != "EN_ATTENTE":
        return erreur("Ce paiement ne peut pas être confirmé.", 409)
    with transaction.atomic():
        paiement.identifiant_transaction = "MANUEL-" + paiement.reference
        valider_paiement(paiement)
    return repondre(paiement.to_dict())
