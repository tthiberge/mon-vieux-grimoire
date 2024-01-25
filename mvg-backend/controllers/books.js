const Book = require('../models/book')
const fs = require('fs');
const ratingUpdated = require('../utils/rating')
const compression = require('../utils/compression')
const sharp = require('sharp')

const MIME_TYPES = {
  'image/jpg': 'webp',
  'image/jpeg': 'webp',
  'image/png': 'webp'
};

exports.createBook = async (req, res, next) => {
  // Création du dossier /images si celui-ci était manquant
  fs.access("./uploads", (error) => {
    if (error) {
      fs.mkdirSync("./uploads");
    }
  })

  // Préparation d'une string unique de dénomination (déporté dans un fichier spécifique)
  const { buffer, compressedName, originalSize} = compression.imageNaming(req)

  // Compression et enregistrement de la photo avec message lié à la compression (déporté dans un fichier spécifique)
  await compression.compressingWithSharp(buffer, compressedName, originalSize)


  // Récupération des informations du formulaire et ajout du userId sécurisé et imageUrl
  const bookObject = JSON.parse(req.body.book)
  delete bookObject.userId

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${compressedName}`
  })


  book.save()
    .then(() => { res.status(201).json({book: book, message: 'Le livre a bien été créé'})})
    .catch( error => res.status(400).json({error}))
}

exports.getAllBooks = (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json('Error:' + error))
}

exports.getOneBook = (req, res) => {
  Book.findOne({_id: req.params.id})
  .then( book => res.status(200).json(book) )
  .catch( error => res.status(400).json('Error:' + error))
}

exports.getBestRatedBooks = (req, res) => {
  Book.find()
  .sort({ averageRating: -1 }) // Sort in descending order based on averageRating
  .limit(3) // Limit the result to the top 3 books
  .then(bestBooks => res.status(200).json(bestBooks))
  .catch(error => res.status(400).json('Error:' + error));
}

exports.updateOneBook = async (req, res) => {

  // Création de l'objet à enregistrer selon ce qui a été modifié
  let bookObject

  if (req.file) {
    // Si présence d'un fichier, on le compresse et on l'enregsitre
    // Préparation d'une string unique de dénomination
    const { buffer, compressedName, originalSize} = compression.imageNaming(req)

    // Compression et enregistrement de la photo
    await compression.compressingWithSharp(buffer, compressedName, originalSize)

    bookObject = {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${compressedName}`
    }
  } else {
    // En l'absence de modification de l'image, le bookObject correspond au corps de la requête
    bookObject = { ...req.body }
  }
  delete bookObject.userId

  console.log('bookObject', bookObject)

  Book.findOne({ _id: req.params.id})
    .then( book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: "Vous n'êtes pas autorisé à modifier le livre"})
      } else {
        // Lorsqu'une photo est updatée, supprimer celle que la nouvelle remplace
        const filename = book.imageUrl.split('/images/')[1];

        fs.unlink(`images/${filename}`, () => {
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({ message: 'Le livre a bien été mis à jour' }))
          .catch(error => res.status(400).json('Error:' + error));
        })
      }
    })
    .catch( error => res.status(400).json({error}))
}

exports.deleteOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id})
    .then( book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: "Vous n'êtes pas autorisé à supprimer le livre"})
      } else {
        const filename = book.imageUrl.split('/images/')[1];

        fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({message: 'Le livre a bien été supprimé'}))
          .catch(error => res.status(400).json('Error:' + error));
        })
      }
    })
    .catch( error => res.status(400).json({error}))
}

exports.rateOneBook = async (req, res) => {
  try {
    const ratedBook = await Book.findOne({_id: req.params.id})

    if (!ratedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const ratedIds = ratedBook.ratings.map(rating => rating.userId)

    if (ratedIds.includes(req.auth.userId)) {
      return res.status(400).json({ error: 'You have already rated this book' });

    } else {
      // Nouveau rating avec userId sécurisé grâce au jwt
      const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
      }

      ratedBook.ratings.push(rating)

      // Calcul de la nouvelle note moyenne
      const bookWithNewRating = ratingUpdated.newAverageRating(ratedBook)

      bookWithNewRating.save() // Save the changes to the database
        .then(book => res.status(200).json(book))
        .catch( error => res.status(400).json({error}))
    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
