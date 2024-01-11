const express = require('express')
const auth = require('../middleware/auth')
const router = express.Router() // Création d'un routeur avec la méthode d'express
const bookController = require('../controllers/books')

router.post('/', bookController.createBook)
router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getOneBook)
router.get('/bestrating', bookController.getBestRatedBooks)
router.put('/:id', auth, bookController.updateOneBook)
router.delete('/:id', auth, bookController.deleteOneBook)
router.post('/:id/rating', auth, bookController.rateOneBook)


// Bien exporter le router de ce fichier pour pouvoir l'importer autre part
module.exports = router;
