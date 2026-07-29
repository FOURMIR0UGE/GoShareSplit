# Mise à jour : alertes gérables et données persistantes

## Ce qui change

- Les annonces, alertes, suggestions et signalements sont stockés hors du dossier redéployé par Hostinger.
- Une migration automatique copie les anciens fichiers de `public/api/data/` lors du premier lancement, uniquement si le nouveau stockage est encore vide.
- Chaque adresse e-mail possède un jeton de gestion sécurisé.
- Le lien **Gérer mes alertes** est présent dans les e-mails et dans la fenêtre de création d’une alerte.
- L’utilisateur peut désactiver, réactiver ou supprimer chaque alerte.
- Aucune validation préalable de l’adresse e-mail n’est demandée.

## Emplacement des données

Par défaut, PHP crée le dossier `gosharesplit-data` à côté de la racine publique du site. Il n’est donc pas remplacé lors d’un nouveau déploiement GitHub.

Il est aussi possible de définir manuellement la variable d’environnement `GSS_DATA_DIR` avec un chemin absolu inscriptible par PHP.

## Important pour le premier déploiement

Ne supprime pas manuellement l’ancien dossier `public/api/data/` avant d’avoir ouvert le site une première fois après cette mise à jour. La première requête vers l’API effectuera la migration automatique des données existantes.

Le fichier privé `public/api/smtp-config.php` doit rester présent directement sur Hostinger et ne doit pas être envoyé sur GitHub.
