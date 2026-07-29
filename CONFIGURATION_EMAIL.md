# Activer l’envoi des e-mails

Le système est déjà intégré :

- confirmation après la création d’une alerte ;
- e-mail automatique lorsqu’une nouvelle annonce correspond au service choisi ;
- prévention des doublons pour une même annonce ;
- lien de désinscription fonctionnel dans chaque e-mail.

## 1. Créer une adresse e-mail

Dans Hostinger, crée par exemple :

`noreply@ton-domaine.fr`

## 2. Configurer le SMTP

Dans le gestionnaire de fichiers Hostinger, ouvre le dossier public du site puis :

`api/`

Copie `smtp-config.example.php`, renomme la copie en :

`smtp-config.php`

Puis renseigne les valeurs :

```php
<?php
return [
  'host' => 'smtp.hostinger.com',
  'port' => 465,
  'secure' => 'ssl',
  'username' => 'noreply@ton-domaine.fr',
  'password' => 'mot-de-passe-de-la-boite-mail',
  'from_email' => 'noreply@ton-domaine.fr',
  'from_name' => 'GoShareSplit',
  'site_url' => 'https://ton-domaine.fr',
];
```

Ne publie jamais `smtp-config.php` sur GitHub. Il contient le mot de passe de la boîte mail.

## 3. Tester

1. Crée une alerte depuis le site avec ta propre adresse.
2. Vérifie que tu reçois l’e-mail de confirmation.
3. Publie ensuite une annonce correspondant exactement au même service.
4. Vérifie la réception du second e-mail.

Si aucun e-mail ne part, vérifie d’abord le dossier spam et les identifiants de la boîte mail Hostinger.
