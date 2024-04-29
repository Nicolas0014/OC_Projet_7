const sharp = require('sharp');
const fs = require('fs');

module.exports = async (req, res, next) => {
   try {

    if (!req.file) { return next();}
    fs.access("./images/536x536", (error) => {
      if (error) {
        fs.mkdirSync("./images/536x536");
      }
    });
    const { buffer, mimetype, originalname } = req.file;
    const newName = req.file.originalname.split(' ').join('_') + Date.now() + '.webp';

    await sharp(buffer)
    .webp({ quality: 20 })
    .resize(536,536)
    .toFile("./images/536x536/" + newName);
    const url = `${req.protocol}://${req.get('host')}/images/536x536/${newName}`;
    req.file.url = url;

    next();
   } catch(error) {
    console.log('erreur:', error)
      res.status(400).json({ error });
   }
};