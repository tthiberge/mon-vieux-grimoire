
git clone

npm install
npm install --force si besoin

nodemon server pour lancer le server.
Les logs s'afficheront dans la console.

La DB du projet utilise un service cloud Mongo DB Atlas.
Vous pouvez lancer le projet en local en indiquant dans les variables d'environnement vos propres identifiants pour Mongo Atlas

Créer un cluster sur votre compte mongo DB Atlas
/!\ choisissez d'autoriser toutes les adresses IP, ou uniquement la votre

Renseigner les variables d'environnement liées à votre cluster:

1.

don't forget to copy env file or ask for it
```shell
cp env.example .env
```

Supprimer env.example et dans .env, remplissez les valeurs de vos variables




FRONT:
git clone

npm install


npm start pour lancer le serveur. Se rendre sur localhost 3000
