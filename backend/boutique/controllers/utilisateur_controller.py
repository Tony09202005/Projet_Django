from django.db.models import Count, Q

from boutique.models import Utilisateur

from .outils import admin_requis, erreur, lire_json, paginer, repondre


@admin_requis
def liste_utilisateurs(request):
    utilisateurs = Utilisateur.objects.annotate(nombre_commandes=Count("commandes"))
    recherche = request.GET.get("search")
    if recherche:
        utilisateurs = utilisateurs.filter(
            Q(email__icontains=recherche) | Q(nom__icontains=recherche) | Q(prenom__icontains=recherche)
        )
    if request.GET.get("role") in ("CLIENT", "ADMIN"):
        utilisateurs = utilisateurs.filter(role=request.GET["role"])
    objets, infos = paginer(request, utilisateurs.order_by("-date_creation"), 10)
    resultat = []
    for u in objets:
        d = u.to_dict()
        d["nombre_commandes"] = u.nombre_commandes
        resultat.append(d)
    infos["results"] = resultat
    return repondre(infos)


@admin_requis
def modifier_utilisateur(request, id):
    if request.method not in ("PATCH", "PUT"):
        return erreur("Méthode non autorisée.", 405)
    utilisateur = Utilisateur.objects.filter(pk=id).first()
    if utilisateur is None:
        return erreur("Utilisateur introuvable.", 404)
    data = lire_json(request) or {}
    if utilisateur.id == request.utilisateur.id:
        return erreur("Vous ne pouvez pas modifier votre propre compte ici.", 400)
    if "est_active" in data:
        utilisateur.est_active = bool(data["est_active"])
    if "role" in data:
        if data["role"] not in ("CLIENT", "ADMIN"):
            return erreur("Rôle invalide.")
        utilisateur.role = data["role"]
    utilisateur.save()
    return repondre(utilisateur.to_dict())
