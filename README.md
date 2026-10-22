# AutoShop

Site de vente de véhicules : catalogue, recherche et filtres, favoris, panier, commandes, paiement simulé, avis,
et espace d'administration avec statistiques.

## Architecture

```text
autoshop_mvc/
├── backend/
│   ├── manage.py
│   ├── config/                    
│   └── boutique/
│       ├── models/                
│       ├── controllers/           
│       ├── routes.py              
│       ├── management/commands/   
│       └── tests.py
├── frontend/src/
│   ├── models/                    
│   ├── controllers/               
│   └── views/                     
│       ├── components/            
│       └── pages/   
└── docs/
    ├── MPD.pdf
    └── login.txt            
```


## Installation

### Backend
```bat
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations boutique
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

### Frontend
```bat
cd frontend
npm install
copy .env.example .env
npm run dev
```


