
from django.db import migrations


def ajouter_donnees_test(apps, schema_editor):
    Marque = apps.get_model("boutique", "Marque")
    Categorie = apps.get_model("boutique", "Categorie")
    Vehicule = apps.get_model("boutique", "Vehicule")

    marques_data = [
        ("Toyota", "Constructeur automobile japonais"),
        ("BMW", "Constructeur automobile allemand"),
        ("Peugeot", "Constructeur automobile français"),
        ("Hyundai", "Constructeur automobile sud-coréen"),
    ]

    marques = {}

    for nom, description in marques_data:
        marque, _ = Marque.objects.using(
            schema_editor.connection.alias
        ).get_or_create(
            nom=nom,
            defaults={
                "description": description,
                "est_active": True,
            },
        )
        marques[nom] = marque

    categories_data = [
        ("Berline", "Voitures berlines"),
        ("SUV", "Véhicules utilitaires sportifs"),
        ("Citadine", "Voitures adaptées à la ville"),
    ]

    categories = {}

    for nom, description in categories_data:
        categorie, _ = Categorie.objects.using(
            schema_editor.connection.alias
        ).get_or_create(
            nom=nom,
            defaults={
                "description": description,
                "est_active": True,
            },
        )
        categories[nom] = categorie

    vehicules_data = [
        {
            "marque": "Toyota",
            "categorie": "Berline",
            "modele": "Corolla",
            "annee": 2022,
            "prix": "25000000.00",
            "kilometrage": 25000,
            "type_carburant": "ESSENCE",
            "transmission": "AUTOMATIQUE",
            "couleur": "Blanc",
            "puissance": 132,
            "etat": "OCCASION",
            "description": "Berline confortable pour les trajets quotidiens.",
        },
        {
            "marque": "BMW",
            "categorie": "Berline",
            "modele": "Serie 3",
            "annee": 2023,
            "prix": "65000000.00",
            "kilometrage": 12000,
            "type_carburant": "ESSENCE",
            "transmission": "AUTOMATIQUE",
            "couleur": "Noir",
            "puissance": 184,
            "etat": "OCCASION",
            "description": "Berline premium avec finition sportive.",
        },
        {
            "marque": "Peugeot",
            "categorie": "SUV",
            "modele": "3008",
            "annee": 2022,
            "prix": "42000000.00",
            "kilometrage": 30000,
            "type_carburant": "DIESEL",
            "transmission": "AUTOMATIQUE",
            "couleur": "Gris",
            "puissance": 130,
            "etat": "OCCASION",
            "description": "SUV familial spacieux et polyvalent.",
        },
        {
            "marque": "Hyundai",
            "categorie": "SUV",
            "modele": "Tucson",
            "annee": 2024,
            "prix": "58000000.00",
            "kilometrage": 0,
            "type_carburant": "HYBRIDE",
            "transmission": "AUTOMATIQUE",
            "couleur": "Bleu",
            "puissance": 230,
            "etat": "NEUF",
            "description": "SUV hybride de démonstration pour les tests.",
        },
        {
            "marque": "Toyota",
            "categorie": "Citadine",
            "modele": "Yaris",
            "annee": 2021,
            "prix": "18000000.00",
            "kilometrage": 40000,
            "type_carburant": "ESSENCE",
            "transmission": "MANUELLE",
            "couleur": "Rouge",
            "puissance": 110,
            "etat": "OCCASION",
            "description": "Citadine économique, pratique en ville.",
        },
    ]

    alias = schema_editor.connection.alias

    for donnees in vehicules_data:
        marque = marques[donnees["marque"]]
        categorie = categories[donnees["categorie"]]

        champs = {
            cle: valeur
            for cle, valeur in donnees.items()
            if cle not in ("marque", "categorie")
        }

        Vehicule.objects.using(alias).get_or_create(
            marque_id=marque.pk,
            categorie_id=categorie.pk,
            modele=champs["modele"],
            annee=champs["annee"],
            defaults={
                **champs,
                "marque_id": marque.pk,
                "categorie_id": categorie.pk,
                "statut": "DISPONIBLE",
            },
        )


class Migration(migrations.Migration):

    dependencies = [
        ('boutique', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            ajouter_donnees_test,
            migrations.RunPython.noop,
        ),
    ]
