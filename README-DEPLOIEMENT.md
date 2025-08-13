# Déploiement en ligne — LawFirm Manager PRO

## Étapes GitHub
1. Placez-vous dans le dossier du projet (celui qui contient `package.json`).
2. Copiez les fichiers de ce pack dans le dossier du projet.
3. Initialisez git et poussez vers GitHub :

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
# Remplacez par l'URL de VOTRE dépôt (créé sur github.com)
git remote add origin https://github.com/VOTRE_COMPTE/lawfirm-manager-pro.git
git push -u origin main
```

### Option CLI (si vous avez GitHub CLI installé)
```bash
gh repo create lawfirm-manager-pro --public --source=. --remote=origin --push
```

## Déploiement sur Render
- Rendez-vous sur https://render.com → New → Web Service → Connecter votre dépôt
- Build Command: `npm install`
- Start Command: `npm start`
- Enforce HTTPS: **ON**
- (Option) Utiliser `render.yaml` pour le déploiement Blueprint.

## Variables d’environnement (Render → Environment)
- `SESSION_SECRET`: générer une valeur forte
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` (si rappels email)
