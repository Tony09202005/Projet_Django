from boutique.models import Categorie, Marque

from .outils import admin_requis, erreur, est_admin, lire_json, repondre, utilisateur_courant


def _liste(request, Modele):
    if request.method == "GET":
        objets = Modele.objects.all()
        if not est_admin(utilisateur_courant(request)):
            objets = objets.filter(est_active=True)
        resultat = []
        for o in objets:
            d = o.to_dict()
            d["nombre_vehicules"] = o.vehicules.filter(statut="DISPONIBLE").count()
            resultat.append(d)
        return repondre({"count": len(resultat), "results": resultat})
    if request.method == "POST":
        return _creer(request, Modele)
    return erreur("Méthode non autorisée.", 405)


@admin_requis
def _creer(request, Modele):
    data = lire_json(request)
    if data is None:
        return erreur("JSON invalide.")
    nom = (data.get("nom") or "").strip()
    if not nom:
        return erreur("Le nom est obligatoire.")
    if Modele.objects.filter(nom__iexact=nom).exists():
        return erreur("Ce nom existe déjà.", 409)
    objet = Modele.objects.create(nom=nom, description=data.get("description") or "", est_active=bool(data.get("est_active", True)))
    return repondre(objet.to_dict(), 201)


def _detail(request, Modele, id):
    objet = Modele.objects.filter(pk=id).first()
    if objet is None:
        return erreur("Introuvable.", 404)
    if request.method == "GET":
        return repondre(objet.to_dict())
    if request.method in ("PUT", "PATCH"):
        return _modifier(request, objet)
    if request.method == "DELETE":
        return _supprimer(request, objet)
    return erreur("Méthode non autorisée.", 405)


@admin_requis
def _modifier(request, objet):
    data = lire_json(request)
    if data is None:
        return erreur("JSON invalide.")
    if "nom" in data:
        nom = data["nom"].strip()
        if not nom:
            return erreur("Le nom est obligatoire.")
        if type(objet).objects.filter(nom__iexact=nom).exclude(pk=objet.pk).exists():
            return erreur("Ce nom existe déjà.", 409)
        objet.nom = nom
    if "description" in data:
        objet.description = data["description"]
    if "est_active" in data:
        objet.est_active = bool(data["est_active"])
    objet.save()
    return repondre(objet.to_dict())


@admin_requis
def _supprimer(request, objet):
    if objet.vehicules.exists():
        return erreur("Suppression impossible : des véhicules utilisent cet élément.", 409)
    objet.delete()
    return repondre({"success": True})


def liste_marques(request):
    return _liste(request, Marque)


def detail_marque(request, id):
    return _detail(request, Marque, id)


def liste_categories(request):
    return _liste(request, Categorie)


def detail_categorie(request, id):
    return _detail(request, Categorie, id)
