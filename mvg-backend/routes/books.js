const express = require('express')
const router = express.Router() // Création d'un routeur avec la méthode d'express
const bookController = require('../controllers/books')

router.post('/', bookController.createBook)
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getOneBook)
router.get('/bestrating', bookController.getBestRatedBooks)
router.put('/:id', bookController.updateOneBook)
router.delete('/:id', bookController.deleteOneBook)
router.post('/:id/rating', bookController.rateOneBook)


// Bien exporter le router de ce fichier pour pouvoir l'importer autre part
module.exports = router;
