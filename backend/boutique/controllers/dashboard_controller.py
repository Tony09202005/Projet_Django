from datetime import datetime

from django.db.models import Count, Sum
from django.utils import timezone

from boutique.models import ArticleCommande, Commande, Marque, Paiement, Utilisateur, Vehicule

from .outils import admin_requis, repondre

NOMS_MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
STATUTS_VENDUS = ["CONFIRMEE", "EN_PREPARATION", "PRETE", "TERMINEE"]


def derniers_mois(nombre):
    """Liste des (annee, mois) des derniers mois, du plus ancien au plus récent."""
    aujourdhui = timezone.now()
    annee, mois = aujourdhui.year, aujourdhui.month
    liste = []
    for _ in range(nombre):
        liste.append((annee, mois))
        mois -= 1
        if mois == 0:
            mois = 12
            annee -= 1
    liste.reverse()
    return liste


def debut_du_mois(annee, mois):
    return timezone.make_aware(datetime(annee, mois, 1))


@admin_requis
def statistiques(request):
    total = Vehicule.objects.count()
    clients = Utilisateur.objects.filter(role="CLIENT").count()
    commandes = Commande.objects.count()
    chiffre_affaires = Paiement.objects.filter(statut="REUSSI").aggregate(t=Sum("montant"))["t"] or 0

    ventes_par_mois = []
    revenus_par_mois = []
    commandes_par_mois = []
    for annee, mois in derniers_mois(6):
        debut = debut_du_mois(annee, mois)
        fin = debut_du_mois(annee + 1, 1) if mois == 12 else debut_du_mois(annee, mois + 1)
        nom = NOMS_MOIS[mois - 1] + " " + str(annee)[2:]
        nb_ventes = ArticleCommande.objects.filter(
            commande__statut__in=STATUTS_VENDUS, commande__date_creation__gte=debut, commande__date_creation__lt=fin
        ).count()
        revenu = Paiement.objects.filter(statut="REUSSI", date_paiement__gte=debut, date_paiement__lt=fin).aggregate(t=Sum("montant"))["t"] or 0
        nb_commandes = Commande.objects.filter(date_creation__gte=debut, date_creation__lt=fin).count()
        ventes_par_mois.append({"mois": nom, "valeur": nb_ventes})
        revenus_par_mois.append({"mois": nom, "valeur": float(revenu)})
        commandes_par_mois.append({"mois": nom, "valeur": nb_commandes})

    marques = Marque.objects.annotate(nb=Count("vehicules")).filter(nb__gt=0)
    plus_consultes = Vehicule.objects.select_related("marque", "categorie").order_by("-nombre_vues")[:5]
    recentes = Commande.objects.select_related("utilisateur").order_by("-date_creation")[:5]

    return repondre({
        "total_vehicules": total,
        "vehicules_disponibles": Vehicule.objects.filter(statut="DISPONIBLE").count(),
        "vehicules_reserves": Vehicule.objects.filter(statut="RESERVE").count(),
        "vehicules_vendus": Vehicule.objects.filter(statut="VENDU").count(),
        "nombre_clients": clients,
        "nombre_commandes": commandes,
        "commandes_en_attente": Commande.objects.filter(statut="EN_ATTENTE").count(),
        "commandes_terminees": Commande.objects.filter(statut="TERMINEE").count(),
        "chiffre_affaires": float(chiffre_affaires),
        "paiements_reussis": Paiement.objects.filter(statut="REUSSI").count(),
        "paiements_echoues": Paiement.objects.filter(statut="ECHOUE").count(),
        "ventes_par_mois": ventes_par_mois,
        "revenus_par_mois": revenus_par_mois,
        "commandes_par_mois": commandes_par_mois,
        "repartition_marques": [{"nom": m.nom, "valeur": m.nb} for m in marques],
        "plus_consultes": [{"id": v.id, "libelle": str(v), "vues": v.nombre_vues} for v in plus_consultes],
        "commandes_recentes": [
            {"id": c.id, "reference": c.reference, "client": c.utilisateur.email, "total": float(c.total), "statut": c.statut}
            for c in recentes
        ],
    })
