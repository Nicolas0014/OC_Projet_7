const BookModel = require('../models/bookModel');

// ---------------- ROUTES GET ---------------- //

exports.getAllBooks = (req, res, next) => {
  BookModel.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneBook = (req, res, next) => {
  BookModel.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};


exports.getBestBooks = (req, res, next) => {
  BookModel.find().then(
    (books) => {
      res.status(200).json(books.sort((a,b) => a.averageRating - b.averageRating).slice(0,3));
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

// ---------------- ROUTES POST ---------------- //

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  const book = new BookModel({
    userId: req.auth.userId,
    title: bookObject.title,
    author: bookObject.author,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    year: bookObject.year,
    genre: bookObject.genre,
    ratings: [],
    averageRating: 0,
  });
  book.save().then(
    () => {
      res.status(201).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.rateBook = async (req, res, next) => {
  try {
    // Vérifier si la note est valide
    if (req.body.grade < 0 || req.body.grade > 5 || !Number.isInteger(req.body.grade)) {
      return res.status(401).json({ message: 'Rating must be an integer between 0 and 5' });
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    const bookToModify = await BookModel.findOne({_id: req.params.id});
    if (bookToModify.ratings.find((e) => e._userId === req.auth.userId)) {
      return res.status(401).json({ message: 'This user has already rated this book.' });
    }

    // Ajouter la nouvelle note au livre et mettre à jour la moyenne
    const rate = { _userId: req.auth.userId, grade: req.body.grade };
    const gradesSum = bookToModify.ratings.map((e) => e.grade).reduce((total, valeur) => total + valeur, req.body.grade);
    const newAverageRating = gradesSum / bookToModify.ratings.length;
    await BookModel.updateOne(
      { _id: req.params.id },
      {
        $push: { ratings: rate },
        $set: { averageRating: newAverageRating }
      }
    );

    res.status(201).json({ message: 'Book\'s average rating updated successfully!' });
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// ---------------- ROUTES PUT ---------------- //

exports.modifyBook = (req, res, next) => {
  const book = new BookModel({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    userId: req.auth.userId
  });
  BookModel.updateOne({_id: req.params.id}, book).then(
    () => {
      res.status(201).json({
        message: 'BookModel updated successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

// ---------------- ROUTES DELETE ---------------- //

exports.deleteBook = (req, res, next) => {
  BookModel.deleteOne({_id: req.params.id, _userId : req.auth.userId}).then(
    () => {
      res.status(200).json({
        message: 'Deleted!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};
