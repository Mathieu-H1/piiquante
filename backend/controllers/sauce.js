//* fs -> modif système de fichiers
const { log, error } = require('console');
const Sauce = require('../models/sauce');
const fs = require('fs');

//* remplace get / post / delete / put

exports.getAllSauce = (req, res, next) => {
    Sauce.find().then(
        (sauces) => {
            res.status(200).json(sauces);
        }
    ).catch(
        (error) => {
            res.status(400).json({
                error: error
            });
        }
    );
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({
        _id: req.params.id
    }).then(
        (sauce) => {
            res.status(200).json(sauce);
        }
    ).catch(
        (error) => {
            res.status(404).json({
                error: error
            });
        }
    );
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId; // suppression car jamais faire confiance
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,    // à la place user_id du token d'authentification
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0
    }); // 1er segment de l'url / hôte du serveur / fichier / nom du fichier

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => {
            res.status(400).json({ error })
        })
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {    // regarde si l'objet existe ou non
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };    // 1er segment de l'url / hôte du serveur / fichier / nom du fichier

    delete sauceObject._userId;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce modifiée!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

// si user aime -> +1 ET ajout user ET  vérifier si user a déjà like (aucun chgt) ou dislike (à enlever)
// si user dislike -> +1 sur dislike ET  vérifier si user a déjà like (à enlever) ou dislike (sans chgt) et 
// si l'utilisateur enlève like ou dislike à retirer des users ET décompte
// different ! tout retirer like /dis + user like /dis -> au début 

exports.likeSauce = (req, res, next) => {
    const like = req.body.like;
    const userId = req.auth.userId;
    const sauceId = req.params.id;

    Sauce.findOne({ _id: sauceId })   // trouver la sauce dans la bdd par rapport à la route
        .then(sauce => {

            //* dif instructions suivant valeur variable like
            //* $inc opérateur mongoDb pour incrémenter ou décrémenter une val num
            //* $pull opérateur mongoDb pour sup d'un tableau une ou des valeurs
            //* $push opérateur mongoDb pour ajouter une valeur dans un tableau

            switch (like) {

                // si user ne "note pas" la sauce
                case 0:
                    if (sauce.usersDisliked.find(user => user == userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "dislikes": -1 },
                                $pull: { "usersDisliked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis supprimé !' }))
                            .catch(error => res.status(401).json({ error }));

                    } else if (sauce.usersLiked.find(user => user == userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "likes": -1 },
                                $pull: { "usersLiked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis supprimé !' }))
                            .catch(error => res.status(401).json({ error }));
                    }

                    else {
                    return res.status(200).json({ message: 'Aucun avis !' });
                    };
                    break;

                // si user aime la sauce
                case 1:
                    if (sauce.usersDisliked.find(user => user == userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "dislikes": -1 },
                                $pull: { "usersDisliked": userId },
                            })
                            .then(() => res.status(200).json({ message: 'Avis supprimé !' }))
                            .catch(error => res.status(401).json({ error }));

                    } else if (sauce.usersLiked.find(user => user == userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "likes": -1 },
                                $pull: { "usersLiked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis supprimé !' }))
                            .catch(error => res.status(401).json({ error }));
                    }

                    else {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "likes": +1 },
                                $push: { "usersLiked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis ajouté !' }))
                            .catch(error => res.status(401).json({ error }));
                    };
                    break;

                // si user n'aime pas la sauce
                case -1:
                    if (sauce.usersDisliked.find(user => user == userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "dislikes": -1 },
                                $pull: { "usersDisliked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis supprimé !' }))
                            .catch(error => res.status(401).json({ error }));

                    } else if (sauce.usersLiked.find(user => user == userId)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "likes": -1 },
                                $pull: { "usersLiked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis supprimé !' }))
                            .catch(error => res.status(401).json({ error }));
                    }

                    else {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $inc: { "dislikes": +1 },
                                $push: { "usersDisliked": userId }
                            })
                            .then(() => res.status(200).json({ message: 'Avis ajouté !' }))
                            .catch(error => res.status(401).json({ error }));
                    };
                    break;
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

//* unlink -> sup fichier
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })   // s'assurer que c'est le bon utilisateur
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Non autorisé' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Sauce supprimée !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};
