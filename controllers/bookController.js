const BookModel = require('../models/bookModel');
const fs = require('fs');

// ---------------- ROUTES GET ---------------- //

exports.getAllBooks = (req, res, next) => {
  BookModel.find()
  .then((books) => res.status(200).json(books))
  .catch((error) => res.status(400).json({ error: error }));
};

exports.getOneBook = (req, res, next) => {
  BookModel.findOne({_id: req.params.id})
  .then((book) => res.status(200).json(book))
  .catch((error) => res.status(404).json({ error: error }));
};

exports.getBestBooks = (req, res, next) => {
  BookModel.find()
  .then((books) => res.status(200).json(books.sort((a,b) => a.averageRating - b.averageRating).slice(0,3)))
  .catch((error) => res.status(404).json({ error: error }));
};

// ---------------- ROUTES POST ---------------- //

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  const book = new BookModel({
    userId: req.auth.userId,
    title: bookObject.title,
    author: bookObject.author,
    imageUrl: req.file.url,
    year: bookObject.year,
    genre: bookObject.genre,
    ratings: [{userId: req.auth.userId, grade: bookObject.ratings[0].grade}],
    averageRating: bookObject.averageRating,
  });
  book.save()
  .then(() => res.status(201).json({ message: 'Post saved successfully!'}))
  .catch((error) => res.status(400).json({ error: error }));
};

exports.rateBook = (req, res, next) => {
  // next();

  // Vérifier si l'utilisateur a déjà noté ce livre
  BookModel.findOne({_id: req.params.id})
  .then((book) => {
    if (book.ratings.find((e) => e.userId === req.auth.userId)) {
      return res.status(401).json({ message: 'This user has already rated this book.' });
    } else {
      // Vérifier si la note est valide
      if (req.body.rating < 0 || req.body.rating > 5 || !Number.isInteger(req.body.rating)) {
        return res.status(401).json({ message: 'Rating must be an integer between 0 and 5' });
      }
      // Ajouter la nouvelle note au livre et mettre à jour la moyenne
      const rate = { userId: req.auth.userId, grade: req.body.rating };
      book.ratings.push(rate);
      const gradesSum = book.ratings.map((e) => e.grade).reduce((total, valeur) => total + valeur, 0);
      const newAverageRating = gradesSum / (book.ratings.length);
      book.averageRating = newAverageRating;

      BookModel.updateOne({_id: req.params.id}, {ratings: book.ratings, averageRating: newAverageRating, _id: req.params.id })
      .then(() => res.status(201).json(book))
      .catch((error) => res.status(400).json({ error: error.message }));
    };
  })
  .catch((error) => res.status(500).json({ error }));
}

// ---------------- ROUTES PUT ---------------- //

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: req.file.url
  } : { ...req.body };

  delete bookObject.userId;
  BookModel.findOne({_id: req.params.id})
  .then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message : 'Not authorized'});
    } else {
      BookModel.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
      .then(() => {
        if (req.file) { 
          const fileToDelete = book.imageUrl.replace(`${req.protocol}://${req.get('host')}/`, '');
          fs.unlink(fileToDelete, () => res.status(201).json({ message: 'File deleted and BookModel updated successfully !'}))
        } else {
          res.status(201).json({ message: 'BookModel updated successfully!'})
        }
      })
      .catch((error) => res.status(400).json({ error: error }));
    };
  })
  .catch((error) => res.status(500).json({ error }));
};

// ---------------- ROUTES DELETE ---------------- //

exports.deleteBook = (req, res, next) => {
  BookModel.findOne({_id: req.params.id})
  .then((book) => {
    if (book.userId != req.auth.userId) {
      res.status(401).json({ message : 'Not authorized'});
    } else {
      const filename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        BookModel.deleteOne({_id: req.params.id})
        .then(() => res.status(200).json({ message: 'Deleted!' }))
        .catch((error) => res.status(400).json({ error: error }));
      });
    };
  })
  .catch((error) => res.status(500).json({ error }));
};
