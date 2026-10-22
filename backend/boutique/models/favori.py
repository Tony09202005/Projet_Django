from django.db import models

from .utilisateur import Utilisateur
from .vehicule import Vehicule


class Favori(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="favoris")
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE, related_name="favoris")
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "FAVORI"
        ordering = ["-date_creation"]
        unique_together = [("utilisateur", "vehicule")]

    def to_dict(self):
        return {"id": self.id, "vehicule": self.vehicule.to_dict()}
