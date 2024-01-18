const Book = require('../models/book')
const fs = require('fs');


exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book)
  delete bookObject.userId

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
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

exports.updateOneBook = (req, res) => {
  // Regarder si le livre en DB appartient bien à ce userId (vérifié grâce au token)
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }
  delete bookObject.userId

  Book.findOne({ _id: req.params.id})
    .then( book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({message: "Vous n'êtes pas autorisé à modifier le livre"})
      } else {
        // Rajouté pour pas accumuler les photos updatées
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
        res.status(401).json({message: "Vous n'êtes pas autorisé à supprimer le livre"})
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
  // Dans le body je récupère le nouveau rating
  console.log(req.body)
  console.log(req.params.id)
  const ratedBook = await Book.findOne({_id: req.params.id})
  console.log(ratedBook)

    if (!ratedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const ratedIds = ratedBook.ratings.map(rating => rating.userId)

    if (ratedIds.includes(req.auth.userId)) {
      return res.status(400).json({ error: 'You have already rated this book' });

    } else {
      // Je construis un array en protégeant le userId qui note grâce au jwt
      const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
      }

      // Faut il utiliser la méthode updateOneBook? Je ne pense pas car c'est vraiment pour le user qui a posté le livre
      ratedBook.ratings.push(rating)

      // Lancer le calcul de averageRating à ce moment là ?
      const allCurrentGrades = ratedBook.ratings.map(rating => rating.grade)
      const newAverage = allCurrentGrades.reduce((acc, rating) => acc + rating) / allCurrentGrades.length
      console.log(newAverage)

      ratedBook.averageRating = newAverage

      console.log(ratedBook)

      ratedBook.save() // Save the changes to the database
        .then(book => res.status(200).json(book))
        .catch( error => res.status(400).json({error}))
    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
