const Book = require('../models/book')
const fs = require('fs');
const ratingUpdated = require('../utils/rating')
const sharp = require('sharp')

const MIME_TYPES = {
  'image/jpg': 'webp',
  'image/jpeg': 'webp',
  'image/png': 'webp'
};

exports.createBook = async (req, res, next) => {
  // Création du dossier /images si celui-ci était manquant
  fs.access("./uploads", (error) => {
    if (error) {
      fs.mkdirSync("./uploads");
    }
  })

  // Préparation d'une string unique de dénomination
  // console.log('req.file', req.file)
  const { buffer, originalname, mimetype } = req.file;
  console.log('mimetype', mimetype)
  console.log('originalName', typeof originalname)

  // const name1 = originalname.split(' ').join('_')
  // console.log('name1', name1)

  // let name2
  // if (mimetype === 'image/png') name2 = originalname.split(' ').join('_').split('.png')[0]

  // console.log('name2', name2)

  // console.log(originalname.split(' ').join('_').split('.jpg')[0])
  // console.log()
  // console.log()
  // console.log()
  // console.log()

  // const changeMimetype = (mimetype, name) => {
  //   if (mimetype === 'image/jpg') {
  //     console.log(mimetype === 'image/jpg')
  //     console.log(originalname.split(' ').join('_').split('.jpg')[0])
  //     return originalname.split(' ').join('_').split('.jpg')[0]
  //   } else if (mimetype === 'image/jpeg') {
  //     console.log(mimetype === 'image/jpeg')
  //     console.log(originalname.split(' ').join('_').split('.jpeg')[0])
  //     return originalname.split(' ').join('_').split('.jpeg')[0]
  //   } else if (mimetype === 'image/png') {
  //     console.log(mimetype === 'image/png')
  //     console.log(originalname.split(' ').join('_').split('.png')[0])
  //     return originalname.split(' ').join('_').split('.png')[0]
  //   }
  // }

  // console.log('test fonction', changeMimetype(mimetype, originalname))

  // console.log('newCleanName', newCleanName)

  // const extension = MIME_TYPES[mimetype];
  // console.log('extension', extension)

  const newName = `${name2}-${Date.now()}.webp`
  console.log('newName', newName)

  // Enregistrement de la photo
  await sharp(buffer)
    .webp({ quality: 20 })
    .toFile("./images/" + newName);


  const bookObject = JSON.parse(req.body.book)
  delete bookObject.userId

  console.log(bookObject)

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    // imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` // If using diskStorage
    imageUrl: `${req.protocol}://${req.get('host')}/images/${newName}` // If using memoryStorage
  })

  console.log(book)


  // book.save()
  //   .then(() => { res.status(201).json({book: book, message: 'Le livre a bien été créé'})})
  //   .catch( error => res.status(400).json({error}))
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
  // Regarder si le livre en DB appartient bien à ce userId (vérifié grâce au token)
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }
  delete bookObject.userId

  Book.findOne({ _id: req.params.id})
    .then( book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: "Vous n'êtes pas autorisé à modifier le livre"})
      } else {
        // Lorsqu'une photo est updatée, supprimer celle que la nouvelle remplace
        const filename = book.imageUrl.split('/images/')[1];

        fs.unlink(`images/${filename}`, () => {
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
          .then(() => res.status(200).json({ message: 'Le livre a bien été mis à jour' }))
          .catch(error => res.status(400).json('Error:' + error));
        })
      }
    })
    .catch( error => res.status(400).json({error}))
}

exports.deleteOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id})
    .then( book => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({message: "Vous n'êtes pas autorisé à supprimer le livre"})
      } else {
        const filename = book.imageUrl.split('/images/')[1];

        fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({_id: req.params.id})
          .then(() => res.status(200).json({message: 'Le livre a bien été supprimé'}))
          .catch(error => res.status(400).json('Error:' + error));
        })
      }
    })
    .catch( error => res.status(400).json({error}))
}

exports.rateOneBook = async (req, res) => {
  try {
    const ratedBook = await Book.findOne({_id: req.params.id})

    if (!ratedBook) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const ratedIds = ratedBook.ratings.map(rating => rating.userId)

    if (ratedIds.includes(req.auth.userId)) {
      return res.status(400).json({ error: 'You have already rated this book' });

    } else {
      // Nouveau rating avec userId sécurisé grâce au jwt
      const rating = {
        userId: req.auth.userId,
        grade: req.body.rating
      }

      ratedBook.ratings.push(rating)

      // Calcul de la nouvelle note moyenne
      const bookWithNewRating = ratingUpdated.newAverageRating(ratedBook)

      bookWithNewRating.save() // Save the changes to the database
        .then(book => res.status(200).json(book))
        .catch( error => res.status(400).json({error}))
    }


  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
