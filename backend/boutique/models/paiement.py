from django.db import models

from .commande import Commande


class Paiement(models.Model):
    METHODES = ["CARTE", "MOBILE_MONEY", "VIREMENT", "ESPECES"]
    STATUTS = ["EN_ATTENTE", "REUSSI", "ECHOUE", "REMBOURSE"]

    commande = models.ForeignKey(Commande, on_delete=models.PROTECT, related_name="paiements")
    reference = models.CharField(max_length=30, unique=True)
    methode = models.CharField(max_length=14, choices=[(m, m) for m in METHODES])
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    statut = models.CharField(max_length=10, choices=[(s, s) for s in STATUTS], default="EN_ATTENTE")
    identifiant_transaction = models.CharField(max_length=100, blank=True)
    date_paiement = models.DateTimeField(null=True, blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "PAIEMENT"
        ordering = ["-date_creation", "-id"]

    def __str__(self):
        return self.reference

    def to_dict(self):
        return {
            "id": self.id,
            "commande": self.commande_id,
            "commande_reference": self.commande.reference,
            "reference": self.reference,
            "methode": self.methode,
            "montant": float(self.montant),
            "statut": self.statut,
            "identifiant_transaction": self.identifiant_transaction,
            "date_paiement": self.date_paiement.isoformat() if self.date_paiement else None,
            "date_creation": self.date_creation.isoformat(),
        }
