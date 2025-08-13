# LawFirm Manager (Gestion d'un cabinet d'avocats)

Application web simple en **Node.js + Express + EJS + SQLite** pour gérer :
- Authentification (admin par défaut)
- Clients
- Dossiers (liés à un client)
- Upload de documents (stockés dans `/uploads/`)

> C'est une base solide et extensible (audiences, factures, paiements, tâches...).

## Prérequis
- Node.js 18+ installé
- Aucune base externe nécessaire (SQLite = fichier local `lawfirm.db`)

## Installation
```bash
cd lawfirm-manager
npm install
npm start
```
Puis ouvrez: http://localhost:3000

## Connexion (par défaut)
- **Email**: `admin@cabinet.local`
- **Mot de passe**: `admin123`

> Changez le mot de passe depuis le code (ou ajoutez une page de gestion des utilisateurs).

## Structure
```
app.js            # point d'entrée express
db.js             # base SQLite + helpers + seed admin
routes/           # routes (auth, clients, dossiers)
views/            # vues EJS
public/           # CSS/JS statiques
uploads/          # documents uploadés
```

## Étapes suivantes (suggestions)
- Rôles & permissions (admin, avocat, assistant)
- Calendrier d'audiences + rappels
- Factures, paiements et rapports PDF
- Recherche et filtres avancés
- Sauvegarde/Export de la base
```
