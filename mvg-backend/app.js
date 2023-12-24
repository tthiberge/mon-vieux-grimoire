const mongoose = require('mongoose')
const express = require('express')
const Book = require('./models/book')
const User = require('./models/user')
const book = require('./models/book')

const app = express()
app.use(express.json()); // Récup formulaire dans req.body
mongoose
  .connect(
    "mongodb+srv://theo:aaaaaaa@cluster0.lvqfnln.mongodb.net/?retryWrites=true&w=majority") // finalement réussi à me connecter...
    // "mongodb+srv://theo:NodeQuiz@node-quiz.llttoxg.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Toute origine
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  ); // Certains types de headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  ); // certaines méthodes
  next(); // Après vérification, passage aux middlewares suivants
});

app.post('/api/auth/signup'), (req, res) => {
  // Hachage du mdp
  const user = new User(req.body)
  user.save()
  .then(user => res.status(200).json({message: "L'utilisateur a bien été créé"}))
  .catch(error => res.status(400).json('Error:' + error));
}

app.post('/api/auth/login'), (req, res) => {
  User.findOne({email: req.body.email})
    .then(user => res.status(200).json({_id: user.id, token: tokenToBeDetermined}))
    .catch(error => res.status(400).json('Error:' + error));
}

app.post('/api/books', (req, res) => {
  // manque token
  const book = new Book(req.body)
  book.save()
  .then(book => res.status(200).json({message: "Le livre a bien été créé"}))
  .catch(error => res.status(400).json('Error:' + error)).then()
})

app.get('/api/books', (req, res) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json('Error:' + error))
});

app.get('/api/books/:id', (req, res) => {
  Book.findOne({_id: req.params.id})
  .then( book => res.status(200).json(book) )
  .catch( error => res.status(400).json('Error:' + error))
})

app.get('/api/books/bestrating', (req, res) => {
  Book.find()
  .sort({ averageRating: -1 }) // Sort in descending order based on averageRating
  .limit(3) // Limit the result to the top 3 books
  .then(bestBooks => res.status(200).json(bestBooks))
  .catch(error => res.status(400).json('Error:' + error));
})

app.put('/api/books/:id', (req, res) => {
  // Token
  // Besoin de mettre à jour l'image ET le livre selon ce qui est chargé
  Book.updateOne({_id: req.params.id}, {...req.body})
    .then(() => res.status(200).json({ message: 'Le livre a bien été mis à jour' }))
    .catch(error => res.status(400).json('Error:' + error));
})

app.delete('/api/books/:id', (req, res) => {
  Book.deleteOne({_id: req.params.id})
    .then(() => res.status(200).json({message: 'Le livre a bien été supprimé'}))
    .catch(error => res.status(400).json('Error:' + error));
})

app.post('/api/books/:id/rating', async (req, res) => {
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

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})





module.exports = app
