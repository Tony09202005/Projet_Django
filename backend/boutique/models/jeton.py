import secrets

from django.db import models

from .utilisateur import Utilisateur


class Jeton(models.Model):
    """Jeton de connexion : le client React l'envoie dans l'en-tête Authorization."""

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="jetons")
    cle = models.CharField(max_length=64, unique=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "JETON"

    @classmethod
    def creer_pour(cls, utilisateur):
        return cls.objects.create(utilisateur=utilisateur, cle=secrets.token_hex(24))
