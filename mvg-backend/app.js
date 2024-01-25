const mongoose = require('mongoose')
const express = require('express')
const path = require('path');

const userRoutes = require('./routes/user')
const booksRoutes = require('./routes/books')

const app = express()

const username = process.env.ATLAS_USERNAME
const password = process.env.ATLAS_PASSWORD
const clusterReference = process.env.ATLAS_CLUSTER_REFERENCE

app.use(express.json()); // Récup formulaire dans req.body
mongoose
  .connect(
    `mongodb+srv://${username}:${password}@${clusterReference}.mongodb.net/?retryWrites=true&w=majority`) // finalement réussi à me connecter...
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

app.use('/api/auth', userRoutes)
app.use('/api/books', booksRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')));



module.exports = app
