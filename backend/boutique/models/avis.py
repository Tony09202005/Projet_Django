from django.db import models

from .utilisateur import Utilisateur
from .vehicule import Vehicule


class Avis(models.Model):
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="avis")
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE, related_name="avis")
    note = models.PositiveSmallIntegerField()
    commentaire = models.TextField(blank=True)
    est_approuve = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "AVIS"
        ordering = ["-date_creation"]
        unique_together = [("utilisateur", "vehicule")]

    def to_dict(self):
        return {
            "id": self.id,
            "auteur": self.utilisateur.prenom,
            "utilisateur_email": self.utilisateur.email,
            "vehicule": self.vehicule_id,
            "vehicule_libelle": str(self.vehicule),
            "note": self.note,
            "commentaire": self.commentaire,
            "est_approuve": self.est_approuve,
            "date_creation": self.date_creation.isoformat(),
        }
