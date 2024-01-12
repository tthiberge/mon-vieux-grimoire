const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

      const userId = decodedToken.userId;

      console.log(req.body)
       req.auth = {
           userId: userId
       };
       console.log('fin du middleware - avant createBOok')
    next();
   } catch(error) {
       res.status(403).json({ error });
   }
};
