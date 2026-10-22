from django.db import models

from .categorie import Categorie
from .marque import Marque


class Vehicule(models.Model):
    CARBURANTS = ["ESSENCE", "DIESEL", "HYBRIDE", "ELECTRIQUE", "AUTRE"]
    TRANSMISSIONS = ["MANUELLE", "AUTOMATIQUE", "SEMI_AUTOMATIQUE"]
    ETATS = ["NEUF", "OCCASION"]
    STATUTS = ["DISPONIBLE", "RESERVE", "VENDU", "INDISPONIBLE"]

    marque = models.ForeignKey(Marque, on_delete=models.PROTECT, related_name="vehicules")
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT, related_name="vehicules")
    modele = models.CharField(max_length=120)
    annee = models.PositiveSmallIntegerField()
    prix = models.DecimalField(max_digits=12, decimal_places=2)
    kilometrage = models.PositiveIntegerField(default=0)
    type_carburant = models.CharField(max_length=12, choices=[(c, c) for c in CARBURANTS])
    transmission = models.CharField(max_length=20, choices=[(t, t) for t in TRANSMISSIONS])
    couleur = models.CharField(max_length=50)
    puissance = models.PositiveIntegerField(default=0)
    nombre_portes = models.PositiveSmallIntegerField(default=4)
    nombre_places = models.PositiveSmallIntegerField(default=5)
    etat = models.CharField(max_length=10, choices=[(e, e) for e in ETATS], default="OCCASION")
    description = models.TextField(blank=True)
    statut = models.CharField(max_length=14, choices=[(s, s) for s in STATUTS], default="DISPONIBLE")
    nombre_vues = models.PositiveIntegerField(default=0)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "VEHICULE"
        ordering = ["-date_creation", "-id"]

    def __str__(self):
        return self.marque.nom + " " + self.modele + " (" + str(self.annee) + ")"

    def to_dict(self):
        return {
            "id": self.id,
            "marque": self.marque_id,
            "marque_nom": self.marque.nom,
            "categorie": self.categorie_id,
            "categorie_nom": self.categorie.nom,
            "modele": self.modele,
            "annee": self.annee,
            "prix": float(self.prix),
            "kilometrage": self.kilometrage,
            "type_carburant": self.type_carburant,
            "transmission": self.transmission,
            "couleur": self.couleur,
            "puissance": self.puissance,
            "nombre_portes": self.nombre_portes,
            "nombre_places": self.nombre_places,
            "etat": self.etat,
            "description": self.description,
            "statut": self.statut,
            "nombre_vues": self.nombre_vues,
            "date_creation": self.date_creation.isoformat(),
        }
