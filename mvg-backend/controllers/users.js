const User = require('..user/models/user')

exports.signup = (req, res) => {
  // Hachage du mdp
  const user = new User(req.body)
  user.save()
  .then(user => res.status(200).json({message: "L'utilisateur a bien été créé"}))
  .catch(error => res.status(400).json('Error:' + error));
}

exports.login = (req, res) => {
  User.findOne({email: req.body.email})
    .then(user => res.status(200).json({_id: user.id, token: tokenToBeDetermined}))
    .catch(error => res.status(400).json('Error:' + error));
}
