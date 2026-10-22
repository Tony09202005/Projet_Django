from django.db import models

from .utilisateur import Utilisateur
from .vehicule import Vehicule


class Commande(models.Model):
    STATUTS = ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "PRETE", "TERMINEE", "ANNULEE", "REMBOURSEE"]

    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.PROTECT, related_name="commandes")
    reference = models.CharField(max_length=30, unique=True)
    sous_total = models.DecimalField(max_digits=12, decimal_places=2)
    frais_livraison = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    statut = models.CharField(max_length=14, choices=[(s, s) for s in STATUTS], default="EN_ATTENTE")
    mode_livraison = models.CharField(max_length=10, default="RETRAIT")
    adresse_livraison = models.TextField(blank=True)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "COMMANDE"
        ordering = ["-date_creation", "-id"]

    def __str__(self):
        return self.reference

    def to_dict(self):
        return {
            "id": self.id,
            "reference": self.reference,
            "utilisateur_email": self.utilisateur.email,
            "sous_total": float(self.sous_total),
            "frais_livraison": float(self.frais_livraison),
            "total": float(self.total),
            "statut": self.statut,
            "mode_livraison": self.mode_livraison,
            "adresse_livraison": self.adresse_livraison,
            "date_creation": self.date_creation.isoformat(),
            "articles": [a.to_dict() for a in self.articles.select_related("vehicule__marque")],
            "paiements": [p.to_dict() for p in self.paiements.all()],
        }


class ArticleCommande(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="articles")
    vehicule = models.ForeignKey(Vehicule, on_delete=models.PROTECT, related_name="articles_commande")
    prix = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        db_table = "ARTICLE_COMMANDE"

    def to_dict(self):
        return {"id": self.id, "vehicule": self.vehicule_id, "libelle": str(self.vehicule), "prix": float(self.prix)}
