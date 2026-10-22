from django.db import models

from .utilisateur import Utilisateur
from .vehicule import Vehicule


class Panier(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name="panier")
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "PANIER"


class ArticlePanier(models.Model):
    panier = models.ForeignKey(Panier, on_delete=models.CASCADE, related_name="articles")
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE, related_name="articles_panier")
    prix = models.DecimalField(max_digits=12, decimal_places=2)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ARTICLE_PANIER"
        ordering = ["-date_ajout"]
        unique_together = [("panier", "vehicule")]

    def to_dict(self):
        return {
            "id": self.id,
            "vehicule": self.vehicule.to_dict(),
            "prix": float(self.vehicule.prix),
            "disponible": self.vehicule.statut == "DISPONIBLE",
        }
