from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class Utilisateur(models.Model):
    ROLES = [("CLIENT", "Client"), ("ADMIN", "Administrateur")]

    prenom = models.CharField(max_length=100)
    nom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=30, blank=True)
    mot_de_passe = models.CharField(max_length=128)
    role = models.CharField(max_length=10, choices=ROLES, default="CLIENT")
    est_active = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "UTILISATEUR"
        ordering = ["-date_creation"]

    def __str__(self):
        return self.prenom + " " + self.nom

    def definir_mot_de_passe(self, mot_de_passe):
        self.mot_de_passe = make_password(mot_de_passe)

    def verifier_mot_de_passe(self, mot_de_passe):
        return check_password(mot_de_passe, self.mot_de_passe)

    def to_dict(self):
        return {
            "id": self.id,
            "prenom": self.prenom,
            "nom": self.nom,
            "email": self.email,
            "telephone": self.telephone,
            "role": self.role,
            "est_active": self.est_active,
            "date_creation": self.date_creation.isoformat(),
        }
