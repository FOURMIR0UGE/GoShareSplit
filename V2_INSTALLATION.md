# GoShareSplit V2 — installation

Cette version conserve les données dans le dossier persistant `gosharesplit-data`, hors du dossier remplacé par les déploiements Hostinger.

## Après le déploiement

1. Conserver le fichier privé `public/api/smtp-config.php` déjà présent sur Hostinger.
2. Ouvrir le site une fois pour créer automatiquement les nouveaux fichiers : catalogue, paramètres, utilisateurs et journal d’activité.
3. Se connecter à `/#/admin` avec le compte administrateur actuel.
4. Dans **Paramètres**, vérifier : 45 jours, 20 places, 2 annonces mises en avant et badge Nouveau pendant 24 heures.

## Compte super utilisateur

L’ancien compte `admin` devient automatiquement le compte super utilisateur unique. Les administrateurs créés depuis le panel peuvent uniquement gérer les modérateurs. Seul le super utilisateur peut gérer les administrateurs.

## Sauvegarde

La ligne `GSS2:` sauvegarde les annonces, alertes, suggestions, catégories, services, paramètres et journal d’activité. Elle n’inclut pas les mots de passe, le mot de passe SMTP ni les clés privées.

Avant une restauration, conserver une copie de la sauvegarde actuelle.
