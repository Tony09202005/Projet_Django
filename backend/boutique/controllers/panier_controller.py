from django.db import IntegrityError

from boutique.models import ArticlePanier, Panier, Vehicule

from .outils import client_requis, erreur, lire_json, repondre


def panier_en_json(utilisateur):
    panier, _ = Panier.objects.get_or_create(utilisateur=utilisateur)
    articles = panier.articles.select_related("vehicule__marque", "vehicule__categorie")
    liste = [a.to_dict() for a in articles]
    sous_total = sum(a["prix"] for a in liste)
    return {"articles": liste, "nombre_articles": len(liste), "sous_total": sous_total}


@client_requis
def voir_panier(request):
    return repondre(panier_en_json(request.utilisateur))


@client_requis
def ajouter_au_panier(request):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    data = lire_json(request) or {}

    if not str(data.get("vehicule", "")).isdigit():
        return erreur("Véhicule invalide.")
    vehicule = Vehicule.objects.filter(pk=data["vehicule"]).exclude(statut="INDISPONIBLE").first()
    if vehicule is None:
        return erreur("Véhicule introuvable.", 404)
    if vehicule.statut != "DISPONIBLE":
        return erreur("Le véhicule n'est plus disponible.", 409)
    panier, _ = Panier.objects.get_or_create(utilisateur=request.utilisateur)
    if ArticlePanier.objects.filter(panier=panier, vehicule=vehicule).exists():
        return erreur("Ce véhicule est déjà dans votre panier.", 409)
    
    try:
        ArticlePanier.objects.create(panier=panier, vehicule=vehicule, prix=vehicule.prix)
    except IntegrityError:
        return erreur("Ce véhicule est déjà dans votre panier.", 409)
    return repondre(panier_en_json(request.utilisateur), 201)


@client_requis
def supprimer_du_panier(request, id):
    if request.method != "DELETE":
        return erreur("Méthode non autorisée.", 405)
    article = ArticlePanier.objects.filter(pk=id, panier__utilisateur=request.utilisateur).first()
    if article is None:
        return erreur("Article introuvable.", 404)
    article.delete()
    return repondre(panier_en_json(request.utilisateur))


@client_requis
def vider_panier(request):
    if request.method != "DELETE":
        return erreur("Méthode non autorisée.", 405)
    ArticlePanier.objects.filter(panier__utilisateur=request.utilisateur).delete()
    return repondre(panier_en_json(request.utilisateur))
