from django.db import IntegrityError

from boutique.models import Avis, Vehicule

from .outils import admin_requis, client_requis, erreur, lire_json, paginer, repondre


@client_requis
def ajouter_avis(request, id):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    vehicule = Vehicule.objects.filter(pk=id).exclude(statut="INDISPONIBLE").first()
    if vehicule is None:
        return erreur("Véhicule introuvable.", 404)
    data = lire_json(request) or {}
    note = data.get("note")
    if not str(note).isdigit() or not 1 <= int(note) <= 5:
        return erreur("La note doit être comprise entre 1 et 5.")
    try:
        avis = Avis.objects.create(
            utilisateur=request.utilisateur, vehicule=vehicule,
            note=int(note), commentaire=(data.get("commentaire") or "").strip(),
        )
    except IntegrityError:
        return erreur("Vous avez déjà donné votre avis sur ce véhicule.", 409)
    resultat = avis.to_dict()
    resultat["message"] = "Merci ! Votre avis sera visible après validation."
    return repondre(resultat, 201)


@admin_requis
def liste_avis(request):
    avis = Avis.objects.select_related("utilisateur", "vehicule__marque")
    approuve = request.GET.get("est_approuve")
    if approuve in ("true", "false"):
        avis = avis.filter(est_approuve=(approuve == "true"))
    objets, infos = paginer(request, avis.order_by("-date_creation"), 10)
    infos["results"] = [a.to_dict() for a in objets]
    return repondre(infos)


@admin_requis
def approuver_avis(request, id):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    avis = Avis.objects.filter(pk=id).first()
    if avis is None:
        return erreur("Avis introuvable.", 404)
    avis.est_approuve = True
    avis.save()
    return repondre(avis.to_dict())


@admin_requis
def supprimer_avis(request, id):
    if request.method != "DELETE":
        return erreur("Méthode non autorisée.", 405)
    avis = Avis.objects.filter(pk=id).first()
    if avis is None:
        return erreur("Avis introuvable.", 404)
    avis.delete()
    return repondre({"success": True})
