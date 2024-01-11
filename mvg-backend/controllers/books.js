const Book = require('../models/book')

exports.createBook = (req, res) => {
  // manque token
  delete req.body._id
  const book = new Book(req.body) // ou new Book({...req.body})
  book.save()
  .then(book => res.status(200).json({message: "Le livre a bien été créé"}))
  .catch(error => res.status(400).json('Error:' + error)).then()
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
  // Token
  // Besoin de mettre à jour l'image ET le livre selon ce qui est chargé
  Book.updateOne({_id: req.params.id}, {...req.body})
    .then(() => res.status(200).json({ message: 'Le livre a bien été mis à jour' }))
    .catch(error => res.status(400).json('Error:' + error));
}

exports.deleteOneBook = (req, res) => {
  Book.deleteOne({_id: req.params.id})
    .then(() => res.status(200).json({message: 'Le livre a bien été supprimé'}))
    .catch(error => res.status(400).json('Error:' + error));
}

exports.rateOneBook = async (req, res) => {
  // Token
  try {
  // Dans le body je récupère le nouveau rating

    const ratedBook = await Book.findOne({_id: req.params.id})

    if (!ratedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const ratedIds = ratedBook.ratings.map(rating => rating.userId)

    if (ratedIds.includes(req.body.userId)) {
      return res.status(400).json({ error: 'You have already rated this book' });

    } else {
      // à voir si l'array de rating est défini comme ça
      ratedBook.ratings.push(req.body)

      await ratedBook.save(); // Save the changes to the database

      return res.status(200).json({ message: 'Rating added successfully' });
    }

    // Lancer le calcul de averageRating à ce moment là ?

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
