const mongoose = require('mongoose')
const express = require('express')

const authRoutes = require('./routes/auth')
const booksRoutes = require('./routes/books')

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

app.use('/api/auth', routes)
app.use('/api/books', routes)



module.exports = app
