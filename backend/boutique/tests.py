import json

from django.test import TestCase

from boutique.models import Categorie, Jeton, Marque, Utilisateur, Vehicule

MDP = "motdepasse123"


def creer_utilisateur(email="client@test.com", role="CLIENT"):
    u = Utilisateur(prenom="Jean", nom="Test", email=email, role=role)
    u.definir_mot_de_passe(MDP)
    u.save()
    return u


def creer_vehicule(**extra):
    marque = Marque.objects.get_or_create(nom="Toyota")[0]
    categorie = Categorie.objects.get_or_create(nom="SUV")[0]
    donnees = dict(marque=marque, categorie=categorie, modele="RAV4", annee=2022, prix=20000,
                   kilometrage=10000, type_carburant="HYBRIDE", transmission="AUTOMATIQUE",
                   couleur="Gris", puissance=200)
    donnees.update(extra)
    return Vehicule.objects.create(**donnees)


class BaseTest(TestCase):
    def appeler(self, methode, url, donnees=None, utilisateur=None):
        en_tetes = {}
        if utilisateur is not None:
            en_tetes["HTTP_AUTHORIZATION"] = "Token " + Jeton.creer_pour(utilisateur).cle
        fonction = getattr(self.client, methode)
        if methode == "get":
            return fonction(url, donnees or {}, **en_tetes)
        return fonction(url, json.dumps(donnees or {}), content_type="application/json", **en_tetes)


class AuthTests(BaseTest):
    def test_inscription_et_connexion(self):
        r = self.appeler("post", "/api/auth/register/", {
            "prenom": "Marie", "nom": "Dupont", "email": "Marie@Test.com",
            "password": MDP, "password_confirmation": MDP, "role": "ADMIN",
        })
        self.assertEqual(r.status_code, 201)
        u = Utilisateur.objects.get(email="marie@test.com")
        self.assertEqual(u.role, "CLIENT")
        self.assertNotEqual(u.mot_de_passe, MDP)
        r = self.appeler("post", "/api/auth/login/", {"email": "marie@test.com", "password": MDP})
        self.assertEqual(r.status_code, 200)
        self.assertIn("token", r.json())

    def test_mauvais_mot_de_passe(self):
        creer_utilisateur()
        r = self.appeler("post", "/api/auth/login/", {"email": "client@test.com", "password": "faux"})
        self.assertEqual(r.status_code, 401)

    def test_profil_demande_un_jeton(self):
        self.assertEqual(self.appeler("get", "/api/auth/me/").status_code, 401)
        u = creer_utilisateur()
        self.assertEqual(self.appeler("get", "/api/auth/me/", utilisateur=u).status_code, 200)


class VehiculeTests(BaseTest):
    def setUp(self):
        self.admin = creer_utilisateur("admin@test.com", "ADMIN")
        self.client_user = creer_utilisateur()
        self.v1 = creer_vehicule()
        self.v2 = creer_vehicule(modele="Corolla", prix=15000, type_carburant="ESSENCE")

    def test_liste_publique_et_filtres(self):
        r = self.appeler("get", "/api/vehicules/")
        self.assertEqual(r.json()["count"], 2)
        r = self.appeler("get", "/api/vehicules/", {"prix_max": 16000})
        self.assertEqual(r.json()["count"], 1)
        r = self.appeler("get", "/api/vehicules/", {"search": "rav"})
        self.assertEqual(r.json()["results"][0]["modele"], "RAV4")
        r = self.appeler("get", "/api/vehicules/", {"ordering": "prix"})
        self.assertEqual(r.json()["results"][0]["modele"], "Corolla")

    def test_creation_reservee_a_l_admin(self):
        donnees = {"marque": self.v1.marque_id, "categorie": self.v1.categorie_id, "modele": "Yaris", "annee": 2021,
                   "prix": 12000, "type_carburant": "ESSENCE", "transmission": "MANUELLE", "couleur": "Rouge", "puissance": 90}
        self.assertEqual(self.appeler("post", "/api/vehicules/", donnees).status_code, 401)
        self.assertEqual(self.appeler("post", "/api/vehicules/", donnees, self.client_user).status_code, 403)
        self.assertEqual(self.appeler("post", "/api/vehicules/", donnees, self.admin).status_code, 201)

    def test_prix_invalide(self):
        r = self.appeler("patch", "/api/vehicules/%d/" % self.v1.id, {"prix": -5}, self.admin)
        self.assertEqual(r.status_code, 400)

    def test_indisponible_cache_au_public(self):
        self.v1.statut = "INDISPONIBLE"
        self.v1.save()
        self.assertEqual(self.appeler("get", "/api/vehicules/").json()["count"], 1)
        self.assertEqual(self.appeler("get", "/api/vehicules/%d/" % self.v1.id).status_code, 404)


class AchatTests(BaseTest):
    def setUp(self):
        self.admin = creer_utilisateur("admin@test.com", "ADMIN")
        self.client_user = creer_utilisateur()
        self.v1 = creer_vehicule()
        self.v2 = creer_vehicule(modele="Corolla", prix=15000)

    def ajouter(self, vehicule, utilisateur=None):
        return self.appeler("post", "/api/panier/ajouter/", {"vehicule": vehicule.id}, utilisateur or self.client_user)

    def commander(self, **extra):
        donnees = {"mode_livraison": "RETRAIT", "methode_paiement": "CARTE"}
        donnees.update(extra)
        return self.appeler("post", "/api/commandes/", donnees, self.client_user)

    def test_panier(self):
        self.assertEqual(self.ajouter(self.v1).status_code, 201)
        self.assertEqual(self.ajouter(self.v1).status_code, 409)
        r = self.appeler("get", "/api/panier/", utilisateur=self.client_user)
        self.assertEqual(r.json()["sous_total"], 20000)
        self.v2.statut = "RESERVE"
        self.v2.save()
        self.assertEqual(self.ajouter(self.v2).status_code, 409)

    def test_commande_calcule_le_total_et_reserve(self):
        self.ajouter(self.v1)
        self.ajouter(self.v2)
        r = self.commander(total=1, sous_total=1)
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["total"], 35000)
        self.v1.refresh_from_db()
        self.assertEqual(self.v1.statut, "RESERVE")
        self.assertEqual(self.appeler("get", "/api/panier/", utilisateur=self.client_user).json()["nombre_articles"], 0)

    def test_commande_refusee_si_vehicule_deja_reserve(self):
        self.ajouter(self.v1)
        Vehicule.objects.filter(pk=self.v1.pk).update(statut="RESERVE")
        r = self.commander()
        self.assertEqual(r.status_code, 409)

    def test_panier_vide(self):
        self.assertEqual(self.commander().status_code, 400)

    def test_annulation_libere_le_vehicule(self):
        self.ajouter(self.v1)
        commande = self.commander().json()
        r = self.appeler("post", "/api/commandes/%d/annuler/" % commande["id"], utilisateur=self.client_user)
        self.assertEqual(r.json()["statut"], "ANNULEE")
        self.v1.refresh_from_db()
        self.assertEqual(self.v1.statut, "DISPONIBLE")

    def test_un_client_ne_voit_pas_les_commandes_des_autres(self):
        self.ajouter(self.v1)
        commande = self.commander().json()
        autre = creer_utilisateur("autre@test.com")
        self.assertEqual(self.appeler("get", "/api/commandes/%d/" % commande["id"], utilisateur=autre).status_code, 404)
        self.assertEqual(self.appeler("get", "/api/commandes/", utilisateur=autre).json()["count"], 0)

    def test_paiement_reussi_puis_vehicule_vendu(self):
        self.ajouter(self.v1)
        commande = self.commander().json()
        pid = commande["paiements"][0]["id"]
        r = self.appeler("post", "/api/paiements/%d/payer/" % pid, {"numero_carte": "4242 4242 4242 4242"}, self.client_user)
        self.assertEqual(r.json()["statut"], "REUSSI")
        self.v1.refresh_from_db()
        self.assertEqual(self.v1.statut, "VENDU")

    def test_paiement_echoue(self):
        self.ajouter(self.v1)
        pid = self.commander().json()["paiements"][0]["id"]
        r = self.appeler("post", "/api/paiements/%d/payer/" % pid, {"numero_carte": "4242 4242 4242 0000"}, self.client_user)
        self.assertEqual(r.json()["statut"], "ECHOUE")
        self.v1.refresh_from_db()
        self.assertEqual(self.v1.statut, "RESERVE")

    def test_dashboard_reserve_a_l_admin(self):
        self.assertEqual(self.appeler("get", "/api/dashboard/statistiques/", utilisateur=self.client_user).status_code, 403)
        r = self.appeler("get", "/api/dashboard/statistiques/", utilisateur=self.admin)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["total_vehicules"], 2)
