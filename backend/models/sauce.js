const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, required: true },
    dislikes: { type: Number, required: true },
    
    usersLiked: [userId, { type: String }], //! ?
    usersDisliked:[userId, { type: String }],   //! ?
});

module.exports = mongoose.model('Sauce', sauceSchema);

// remplacer Thing par Sauce dans doc