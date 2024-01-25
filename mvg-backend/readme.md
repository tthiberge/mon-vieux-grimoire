# Mon vieux Grimoire

## Cloner le projet

Cloner le projet `mvg-backend` sur votre machine puis rendez vous dans le dossier correspondant.

## Comment lancer le projet ? 

### Avec npm

Faites la commande `npm install` pour installer les dépendances (eventuellement `npm install --force` en cas de conflits) puis `nodemon server` pour lancer le projet. 

Les logs s'afficheront dans la console.

### Base de données et variables d'environnement

La base de données du projet utilise un service cloud Mongo DB Atlas.
Vous pouvez lancer le projet en local en indiquant dans les variables d'environnement vos propres identifiants pour Mongo Atlas.

Vous aurez besoin de créer votre propre cluster sur votre compte mongo DB Atlas.

Renseigner les variables d'environnement liées à votre cluster:

Vous trouverez dans le clone que vous aurez effectué un fichier `.env.example` reprenant les variables d'environnements prévues dans le projet.
NB: Les valeurs indiquées sont des placeholders, à vous d'indiquer vos valeurs correspondantes.

Copier le fichier `.env.example` en un fichier .env qui contiendra vos propres valeurs:
```shell
cp env.example .env
```

Supprimer `env.example`.

Une fois vos valeurs Mongo Atlas indiquées dans `.env`, le projet devrait tourner!

### Happy book-reading!
