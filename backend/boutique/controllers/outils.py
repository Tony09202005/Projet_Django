import json
from datetime import timedelta
from decimal import Decimal, InvalidOperation
from functools import wraps

from django.core.paginator import EmptyPage, Paginator
from django.http import JsonResponse
from django.utils import timezone

from boutique.models import Jeton


def repondre(donnees, statut=200):
    return JsonResponse(donnees, status=statut, safe=False)


def erreur(message, statut=400, details=None):
    return JsonResponse({"success": False, "message": message, "errors": details}, status=statut)


def lire_json(request):
    try:
        donnees = json.loads(request.body or "{}")
    except ValueError:
        return None
    if not isinstance(donnees, dict):
        return None
    return donnees


def en_nombre(valeur):
    try:
        return Decimal(str(valeur))
    except (InvalidOperation, ValueError):
        return None


def utilisateur_courant(request):
    """Retourne l'utilisateur connecté (ou None) à partir de l'en-tête Authorization: Token xxx"""
    entete = request.headers.get("Authorization", "")
    if not entete.startswith("Token "):
        return None
    jeton = Jeton.objects.filter(cle=entete[6:].strip()).select_related("utilisateur").first()
    if jeton is None:
        return None
    if jeton.date_creation < timezone.now() - timedelta(days=7):
        jeton.delete()
        return None
    if not jeton.utilisateur.est_active:
        return None
    return jeton.utilisateur


def est_admin(utilisateur):
    return utilisateur is not None and utilisateur.role == "ADMIN"


def connexion_requise(vue):
    @wraps(vue)
    def enveloppe(request, *args, **kwargs):
        utilisateur = utilisateur_courant(request)
        if utilisateur is None:
            return erreur("Vous devez être connecté.", 401)
        request.utilisateur = utilisateur
        return vue(request, *args, **kwargs)
    return enveloppe


def client_requis(vue):
    @wraps(vue)
    def enveloppe(request, *args, **kwargs):
        utilisateur = utilisateur_courant(request)
        if utilisateur is None:
            return erreur("Vous devez être connecté.", 401)
        if utilisateur.role != "CLIENT":
            return erreur("Réservé aux clients.", 403)
        request.utilisateur = utilisateur
        return vue(request, *args, **kwargs)
    return enveloppe


def admin_requis(vue):
    @wraps(vue)
    def enveloppe(request, *args, **kwargs):
        utilisateur = utilisateur_courant(request)
        if utilisateur is None:
            return erreur("Vous devez être connecté.", 401)
        if utilisateur.role != "ADMIN":
            return erreur("Réservé aux administrateurs.", 403)
        request.utilisateur = utilisateur
        return vue(request, *args, **kwargs)
    return enveloppe


def paginer(request, queryset, taille_defaut=12):
    """Découpe une liste en pages. Retourne (objets de la page, infos de pagination)."""
    try:
        taille = min(int(request.GET.get("taille", taille_defaut)), 100)
    except ValueError:
        taille = taille_defaut
    try:
        numero = int(request.GET.get("page", 1))
    except ValueError:
        numero = 1
    paginateur = Paginator(queryset, max(taille, 1))
    try:
        page = paginateur.page(numero)
    except EmptyPage:
        page = paginateur.page(paginateur.num_pages)
    infos = {"count": paginateur.count, "page": page.number, "pages": paginateur.num_pages, "taille": taille}
    return page.object_list, infos
