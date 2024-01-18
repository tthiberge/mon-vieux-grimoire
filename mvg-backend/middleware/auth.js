const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
    const userId = decodedToken.userId

    // On crée un champ dans la requête transmise par la suite pour que nos middlewares suivants aient accès au userId extrait par l'authentification.
    req.auth = {
      userId: userId
    }

    next()
  } catch (error) {
    return res.status(401).json({error})
  }
}
