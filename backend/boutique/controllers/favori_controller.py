from django.db import IntegrityError

from boutique.models import Favori, Vehicule

from .outils import client_requis, erreur, lire_json, repondre


@client_requis
def liste_favoris(request):
    favoris = Favori.objects.filter(utilisateur=request.utilisateur).select_related("vehicule__marque", "vehicule__categorie")
    resultat = [f.to_dict() for f in favoris]
    return repondre({"count": len(resultat), "results": resultat})


@client_requis
def ajouter_favori(request):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    data = lire_json(request) or {}
    vehicule = Vehicule.objects.filter(pk=data.get("vehicule")).exclude(statut="INDISPONIBLE").first() if str(data.get("vehicule", "")).isdigit() else None
    if vehicule is None:
        return erreur("Véhicule introuvable.", 404)
    try:
        favori = Favori.objects.create(utilisateur=request.utilisateur, vehicule=vehicule)
    except IntegrityError:
        return erreur("Ce véhicule est déjà dans vos favoris.", 409)
    return repondre(favori.to_dict(), 201)


@client_requis
def supprimer_favori(request, id):
    if request.method != "DELETE":
        return erreur("Méthode non autorisée.", 405)
    favori = Favori.objects.filter(pk=id, utilisateur=request.utilisateur).first()
    if favori is None:
        return erreur("Favori introuvable.", 404)
    favori.delete()
    return repondre({"success": True})
