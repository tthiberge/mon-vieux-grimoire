const express = require('express')
const router = express.Router() // Création d'un routeur avec la méthode d'express
const userController = require('../controllers/users')

router.post('/signup', userController.signup) // post car on envoie des informations
router.post('/login', userController.login) // post car on envoie des informations

// Bien exporter le router de ce fichier pour pouvoir l'importer autre part
module.exports = router;
