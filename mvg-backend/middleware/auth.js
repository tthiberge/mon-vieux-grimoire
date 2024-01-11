const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
   try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');

      console.log(decodedToken)

      const userId = decodedToken.userId;

      console.log(req)
       req.auth = {
           userId: userId
       };
       console.log(req)
    next();
   } catch(error) {
       res.status(402).json({ error });
   }
};
