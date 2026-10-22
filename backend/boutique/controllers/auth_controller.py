from boutique.models import Jeton, Utilisateur

from .outils import connexion_requise, erreur, lire_json, repondre


def inscription(request):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    data = lire_json(request)
    if data is None:
        return erreur("JSON invalide.")

    prenom = (data.get("prenom") or "").strip()
    nom = (data.get("nom") or "").strip()
    email = (data.get("email") or "").strip().lower()
    mot_de_passe = data.get("password") or ""

    if not prenom or not nom or not email or not mot_de_passe:
        return erreur("Prénom, nom, email et mot de passe sont obligatoires.")
    if "@" not in email:
        return erreur("Adresse email invalide.")
    if len(mot_de_passe) < 8:
        return erreur("Le mot de passe doit contenir au moins 8 caractères.")
    if data.get("password_confirmation") != mot_de_passe:
        return erreur("Les mots de passe ne correspondent pas.")
    if Utilisateur.objects.filter(email=email).exists():
        return erreur("Un compte existe déjà avec cet email.", 409)

    utilisateur = Utilisateur(prenom=prenom, nom=nom, email=email, telephone=data.get("telephone") or "", role="CLIENT")
    utilisateur.definir_mot_de_passe(mot_de_passe)
    utilisateur.save()

    jeton = Jeton.creer_pour(utilisateur)
    return repondre({"token": jeton.cle, "utilisateur": utilisateur.to_dict()}, 201)


def connexion(request):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    data = lire_json(request)
    if data is None:
        return erreur("JSON invalide.")

    email = (data.get("email") or "").strip().lower()
    utilisateur = Utilisateur.objects.filter(email=email).first()

    if utilisateur is None or not utilisateur.verifier_mot_de_passe(data.get("password") or ""):
        return erreur("Email ou mot de passe incorrect.", 401)
    if not utilisateur.est_active:
        return erreur("Ce compte est désactivé.", 403)

    jeton = Jeton.creer_pour(utilisateur)
    return repondre({"token": jeton.cle, "utilisateur": utilisateur.to_dict()})


@connexion_requise
def deconnexion(request):
    if request.method != "POST":
        return erreur("Méthode non autorisée.", 405)
    cle = request.headers.get("Authorization", "")[6:].strip()
    Jeton.objects.filter(cle=cle).delete()
    return repondre({"success": True, "message": "Déconnexion réussie."})


@connexion_requise
def profil(request):
    utilisateur = request.utilisateur
    if request.method == "GET":
        return repondre(utilisateur.to_dict())

    if request.method in ("PATCH", "PUT"):
        data = lire_json(request)
        if data is None:
            return erreur("JSON invalide.")
        if "prenom" in data:
            utilisateur.prenom = data["prenom"].strip()
        if "nom" in data:
            utilisateur.nom = data["nom"].strip()
        if "telephone" in data:
            utilisateur.telephone = data["telephone"].strip()
        if not utilisateur.prenom or not utilisateur.nom:
            return erreur("Le prénom et le nom ne peuvent pas être vides.")
        utilisateur.save()
        return repondre(utilisateur.to_dict())

    return erreur("Méthode non autorisée.", 405)
