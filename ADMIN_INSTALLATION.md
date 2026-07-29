# Installation du panel administrateur

Le panel est disponible à l'adresse `/admin` après le déploiement.

L'authentification est vérifiée côté serveur par PHP. Le mot de passe n'est pas présent en clair dans le code : seul son hash est enregistré dans `public/api/config.php`.

Les annonces, suggestions, alertes et signalements sont stockés dans `public/api/data/`. Le dossier est protégé par un fichier `.htaccess`.

Important : l'hébergement doit exécuter PHP et autoriser l'écriture dans `api/data`. Sur Hostinger, PHP est normalement disponible. En cas d'erreur d'écriture, régler les permissions du dossier `api/data` sur 750 ou 755 depuis le gestionnaire de fichiers.
