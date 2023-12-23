const mongoose = require('mongoose')
const express = require('express')
const Book = require('./models/book')
const User = require('./models/user')

const app = express()
app.use(express.json()); // Récup formulaire dans req.body
mongoose
  .connect(
    "mongodb+srv://theo:NodeQuiz@node-quiz.llttoxg.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));


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





module.exports = app
