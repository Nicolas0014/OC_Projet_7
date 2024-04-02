const StuffModel = require('../models/stuffModel');

exports.createStuff = (req, res, next) => {
  const stuff = new StuffModel({
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    userId: req.body.userId
  });
  stuff.save().then(
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

exports.getOneStuff = (req, res, next) => {
  StuffModel.findOne({
    _id: req.params.id
  }).then(
    (stuff) => {
      res.status(200).json(stuff);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifyStuff = (req, res, next) => {
  const stuff = new StuffModel({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    imageUrl: req.body.imageUrl,
    price: req.body.price,
    userId: req.body.userId
  });
  StuffModel.updateOne({_id: req.params.id}, stuff).then(
    () => {
      res.status(201).json({
        message: 'StuffModel updated successfully!'
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

exports.deleteStuff = (req, res, next) => {
  StuffModel.deleteOne({_id: req.params.id, _userId : req.auth.userId}).then(
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

exports.getAllStuff = (req, res, next) => {
  StuffModel.find().then(
    (stuffs) => {
      res.status(200).json(stuffs);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};