const mongoose = require('mongoose')
const express = require('express')

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

module.exports = app
