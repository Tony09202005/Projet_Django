import os
import secrets

from django.core.management.base import BaseCommand

from boutique.models import Categorie, Marque, Utilisateur, Vehicule

MARQUES = ["Toyota", "BMW", "Mercedes-Benz", "Audi", "Ford", "Honda", "Nissan", "Peugeot", "Renault", "Volkswagen"]
CATEGORIES = ["Berline", "SUV", "Citadine", "Coupé", "Cabriolet", "Pick-up", "Sportive", "Utilitaire"]

VEHICULES = [
    ("Toyota", "Berline", "Corolla", 2021, 18900, 42000, "HYBRIDE", "AUTOMATIQUE", "Blanc", 122, "OCCASION"),
    ("Toyota", "SUV", "RAV4", 2023, 36500, 8000, "HYBRIDE", "AUTOMATIQUE", "Gris", 222, "OCCASION"),
    ("Toyota", "Pick-up", "Hilux", 2022, 33900, 25000, "DIESEL", "MANUELLE", "Blanc", 204, "OCCASION"),
    ("Toyota", "Citadine", "Yaris", 2024, 21500, 0, "HYBRIDE", "AUTOMATIQUE", "Rouge", 116, "NEUF"),
    ("BMW", "Berline", "Série 3 320d", 2020, 31900, 61000, "DIESEL", "AUTOMATIQUE", "Noir", 190, "OCCASION"),
    ("BMW", "SUV", "X5 xDrive30d", 2022, 64900, 22000, "DIESEL", "AUTOMATIQUE", "Gris", 286, "OCCASION"),
    ("BMW", "Coupé", "Série 4 430i", 2023, 52900, 12000, "ESSENCE", "AUTOMATIQUE", "Bleu", 258, "OCCASION"),
    ("Mercedes-Benz", "Berline", "Classe C 220d", 2021, 38900, 39000, "DIESEL", "AUTOMATIQUE", "Argent", 194, "OCCASION"),
    ("Mercedes-Benz", "Cabriolet", "CLE Cabriolet", 2024, 78900, 0, "ESSENCE", "AUTOMATIQUE", "Rouge", 258, "NEUF"),
    ("Audi", "Berline", "A4 35 TDI", 2020, 27900, 72000, "DIESEL", "SEMI_AUTOMATIQUE", "Gris", 163, "OCCASION"),
    ("Audi", "SUV", "Q5 40 TDI", 2022, 46900, 28000, "DIESEL", "AUTOMATIQUE", "Blanc", 204, "OCCASION"),
    ("Audi", "Sportive", "RS3 Sportback", 2023, 69900, 7000, "ESSENCE", "SEMI_AUTOMATIQUE", "Vert", 400, "OCCASION"),
    ("Ford", "Pick-up", "Ranger Wildtrak", 2021, 35900, 48000, "DIESEL", "AUTOMATIQUE", "Orange", 213, "OCCASION"),
    ("Ford", "Utilitaire", "Transit Custom", 2020, 22900, 89000, "DIESEL", "MANUELLE", "Blanc", 130, "OCCASION"),
    ("Honda", "SUV", "CR-V e:HEV", 2023, 38900, 11000, "HYBRIDE", "AUTOMATIQUE", "Argent", 184, "OCCASION"),
    ("Honda", "Citadine", "Jazz", 2022, 19900, 21000, "HYBRIDE", "AUTOMATIQUE", "Bleu", 109, "OCCASION"),
    ("Nissan", "SUV", "Qashqai", 2022, 24900, 33000, "ESSENCE", "MANUELLE", "Gris", 140, "OCCASION"),
    ("Nissan", "Citadine", "Leaf", 2021, 17900, 36000, "ELECTRIQUE", "AUTOMATIQUE", "Blanc", 150, "OCCASION"),
    ("Peugeot", "Citadine", "208", 2023, 17500, 14000, "ESSENCE", "MANUELLE", "Rouge", 100, "OCCASION"),
    ("Peugeot", "SUV", "3008", 2022, 29900, 26000, "DIESEL", "AUTOMATIQUE", "Noir", 130, "OCCASION"),
    ("Renault", "Citadine", "Clio V", 2023, 15900, 9000, "ESSENCE", "MANUELLE", "Orange", 90, "OCCASION"),
    ("Renault", "Utilitaire", "Kangoo Van", 2022, 16900, 41000, "DIESEL", "MANUELLE", "Blanc", 95, "OCCASION"),
    ("Volkswagen", "Berline", "Passat", 2021, 24900, 56000, "DIESEL", "SEMI_AUTOMATIQUE", "Gris", 150, "OCCASION"),
    ("Volkswagen", "SUV", "Tiguan", 2023, 34500, 15000, "ESSENCE", "SEMI_AUTOMATIQUE", "Bleu", 150, "OCCASION"),
    ("Volkswagen", "Citadine", "Golf 8", 2024, 28900, 0, "ESSENCE", "SEMI_AUTOMATIQUE", "Vert", 130, "NEUF"),
]


class Command(BaseCommand):
    help = "Crée des marques, catégories, véhicules et deux comptes de test."

    def add_arguments(self, parser):
        parser.add_argument("--admin-password", default=os.environ.get("SEED_ADMIN_PASSWORD"))
        parser.add_argument("--client-password", default=os.environ.get("SEED_CLIENT_PASSWORD"))

    def creer_compte(self, email, mot_de_passe, role, prenom, nom):
        if Utilisateur.objects.filter(email=email).exists():
            self.stdout.write(email + " existe déjà (mot de passe inchangé).")
            return
        # si aucun mot de passe n'est donné on en génère un au hasard
        if not mot_de_passe:
            mot_de_passe = secrets.token_urlsafe(9)
        utilisateur = Utilisateur(prenom=prenom, nom=nom, email=email, role=role)
        utilisateur.definir_mot_de_passe(mot_de_passe)
        utilisateur.save()
        self.stdout.write("Compte " + role + " : " + email + " / " + mot_de_passe + "  (à noter, affiché une seule fois)")

    def handle(self, *args, **options):
        marques = {}
        for nom in MARQUES:
            marques[nom] = Marque.objects.get_or_create(nom=nom)[0]
        categories = {}
        for nom in CATEGORIES:
            categories[nom] = Categorie.objects.get_or_create(nom=nom)[0]

        crees = 0
        for (marque, categorie, modele, annee, prix, km, carburant, transmission, couleur, puissance, etat) in VEHICULES:
            if Vehicule.objects.filter(marque=marques[marque], modele=modele, annee=annee).exists():
                continue
            Vehicule.objects.create(
                marque=marques[marque], categorie=categories[categorie], modele=modele, annee=annee,
                prix=prix, kilometrage=km, type_carburant=carburant, transmission=transmission,
                couleur=couleur, puissance=puissance, etat=etat,
                description=marque + " " + modele + " " + str(annee) + ", " + couleur.lower() + ". Véhicule contrôlé et prêt à rouler.",
            )
            crees += 1
        self.stdout.write(self.style.SUCCESS(str(crees) + " véhicule(s) créé(s)."))

        self.creer_compte("admin@autoshop.local", options["admin_password"], "ADMIN", "Admin", "AutoShop")
        self.creer_compte("client@autoshop.local", options["client_password"], "CLIENT", "Client", "Test")
