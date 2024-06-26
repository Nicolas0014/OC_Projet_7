const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const User = require('../models/UserModel')

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash,
        });
        console.log(user)
        user.save()
        .then(() => res.status(201).json({message: 'Utilisateur créé !'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
    .then(user => {
        if (user === null) {
            return res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'})
        } else {
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid){
                    return res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'})
                } else {
                    console.log(user._id);
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id }, // Contenu (en échange du token)
                            process.env.RANDOM_TOKEN_SECRET,
                            { expiresIn: '24h' }
                        )
                    })
                }
            })
            .catch(error => res.status(500).json({error}));
        }
    })
    .catch(error => res.status(500).json({error}));
};