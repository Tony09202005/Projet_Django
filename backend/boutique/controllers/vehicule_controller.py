from django.db.models import Avg, Count, F, Q

from boutique.models import Avis, Categorie, Marque, Vehicule

from .outils import admin_requis, en_nombre, erreur, est_admin, lire_json, paginer, repondre, utilisateur_courant

CHAMPS_OBLIGATOIRES = ["marque", "categorie", "modele", "annee", "prix", "type_carburant", "transmission", "couleur", "puissance"]
CHAMPS_TEXTE = ["modele", "couleur", "description"]
CHAMPS_ENTIERS = ["annee", "kilometrage", "puissance", "nombre_portes", "nombre_places"]

TRIS = {
    "prix": "prix", "-prix": "-prix",
    "annee": "annee", "-annee": "-annee",
    "kilometrage": "kilometrage", "-kilometrage": "-kilometrage",
    "date_creation": "date_creation", "-date_creation": "-date_creation",
    "-nombre_vues": "-nombre_vues",
}


def liste_vehicules(request):
    if request.method == "GET":
        return lister_vehicules(request)
    if request.method == "POST":
        return creer_vehicule(request)
    return erreur("Méthode non autorisée.", 405)


def lister_vehicules(request):
    utilisateur = utilisateur_courant(request)
    vehicules = Vehicule.objects.select_related("marque", "categorie")

    if not est_admin(utilisateur):
        vehicules = vehicules.exclude(statut="INDISPONIBLE")
        vehicules = vehicules.filter(marque__est_active=True, categorie__est_active=True)

    recherche = request.GET.get("search")
    if recherche:
        vehicules = vehicules.filter(
            Q(marque__nom__icontains=recherche) | Q(modele__icontains=recherche) | Q(description__icontains=recherche)
        )

    marque = request.GET.get("marque")
    if marque and marque.isdigit():
        vehicules = vehicules.filter(marque_id=marque)
    categorie = request.GET.get("categorie")
    if categorie and categorie.isdigit():
        vehicules = vehicules.filter(categorie_id=categorie)

    for champ in ["type_carburant", "transmission", "etat", "statut"]:
        valeur = request.GET.get(champ)
        if valeur:
            vehicules = vehicules.filter(**{champ: valeur})

    bornes = {
        "prix_min": "prix__gte", "prix_max": "prix__lte",
        "annee_min": "annee__gte", "annee_max": "annee__lte",
        "kilometrage_max": "kilometrage__lte",
    }
    for parametre, condition in bornes.items():
        valeur = en_nombre(request.GET.get(parametre)) if request.GET.get(parametre) else None
        if valeur is not None:
            vehicules = vehicules.filter(**{condition: valeur})

    tri = TRIS.get(request.GET.get("ordering"), "-date_creation")
    vehicules = vehicules.order_by(tri, "-id")

    objets, infos = paginer(request, vehicules, 12)
    infos["results"] = [v.to_dict() for v in objets]
    return repondre(infos)


def remplir_vehicule(data, vehicule=None):
    """Remplit un véhicule avec les données reçues. Retourne (vehicule, erreurs)."""
    erreurs = {}
    creation = vehicule is None
    if creation:
        vehicule = Vehicule()
        for champ in CHAMPS_OBLIGATOIRES:
            if data.get(champ) in (None, ""):
                erreurs[champ] = "Ce champ est obligatoire."

    if "marque" in data and data["marque"] not in (None, ""):
        marque = Marque.objects.filter(pk=data["marque"]).first() if str(data["marque"]).isdigit() else None
        if marque is None:
            erreurs["marque"] = "Marque inconnue."
        else:
            vehicule.marque = marque
    if "categorie" in data and data["categorie"] not in (None, ""):
        categorie = Categorie.objects.filter(pk=data["categorie"]).first() if str(data["categorie"]).isdigit() else None
        if categorie is None:
            erreurs["categorie"] = "Catégorie inconnue."
        else:
            vehicule.categorie = categorie

    for champ in CHAMPS_TEXTE:
        if champ in data:
            setattr(vehicule, champ, str(data[champ]).strip())

    for champ in CHAMPS_ENTIERS:
        if champ in data and data[champ] not in (None, ""):
            if not str(data[champ]).isdigit():
                erreurs[champ] = "Nombre entier positif attendu."
            else:
                setattr(vehicule, champ, int(data[champ]))

    if "prix" in data and data["prix"] not in (None, ""):
        prix = en_nombre(data["prix"])
        if prix is None or prix <= 0:
            erreurs["prix"] = "Le prix doit être un nombre positif."
        else:
            vehicule.prix = prix

    choix = {
        "type_carburant": Vehicule.CARBURANTS, "transmission": Vehicule.TRANSMISSIONS,
        "etat": Vehicule.ETATS, "statut": Vehicule.STATUTS,
    }
    for champ, valeurs in choix.items():
        if champ in data and data[champ] not in (None, ""):
            if data[champ] not in valeurs:
                erreurs[champ] = "Valeur invalide."
            else:
                setattr(vehicule, champ, data[champ])

    if vehicule.annee is not None and "annee" in data and not erreurs.get("annee"):
        if vehicule.annee < 1950 or vehicule.annee > 2100:
            erreurs["annee"] = "Année invalide."

    return vehicule, erreurs


@admin_requis
def creer_vehicule(request):
    data = lire_json(request)
    if data is None:
        return erreur("JSON invalide.")
    vehicule, erreurs = remplir_vehicule(data)
    if erreurs:
        return erreur("Données invalides.", 400, erreurs)
    vehicule.save()
    return repondre(vehicule.to_dict(), 201)


def detail_vehicule(request, id):
    utilisateur = utilisateur_courant(request)
    vehicule = Vehicule.objects.select_related("marque", "categorie").filter(pk=id).first()
    if vehicule is None or (vehicule.statut == "INDISPONIBLE" and not est_admin(utilisateur)):
        return erreur("Véhicule introuvable.", 404)

    if request.method == "GET":
        if not est_admin(utilisateur):
            Vehicule.objects.filter(pk=id).update(nombre_vues=F("nombre_vues") + 1)
            vehicule.nombre_vues += 1
        avis = Avis.objects.filter(vehicule=vehicule, est_approuve=True).select_related("utilisateur")
        stats = avis.aggregate(moyenne=Avg("note"), total=Count("id"))
        resultat = vehicule.to_dict()
        resultat["avis"] = [a.to_dict() for a in avis]
        resultat["note_moyenne"] = stats["moyenne"]
        resultat["nombre_avis"] = stats["total"]
        return repondre(resultat)

    if request.method in ("PUT", "PATCH"):
        return modifier_vehicule(request, vehicule)
    if request.method == "DELETE":
        return supprimer_vehicule(request, vehicule)
    return erreur("Méthode non autorisée.", 405)


@admin_requis
def modifier_vehicule(request, vehicule):
    data = lire_json(request)
    if data is None:
        return erreur("JSON invalide.")
    vehicule, erreurs = remplir_vehicule(data, vehicule)
    if erreurs:
        return erreur("Données invalides.", 400, erreurs)
    vehicule.save()
    return repondre(vehicule.to_dict())


@admin_requis
def supprimer_vehicule(request, vehicule):
    if vehicule.articles_commande.exists():
        return erreur("Ce véhicule a déjà été commandé : passez-le en INDISPONIBLE plutôt que de le supprimer.", 409)
    vehicule.delete()
    return repondre({"success": True})
