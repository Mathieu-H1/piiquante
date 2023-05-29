//* express: framework pour créat° et gest° serveur
//* mongoose: package pour faciliter échanges avec bdd mongoDB (bdd = base de donnée)
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');   //! essai

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express();

//* middleware général pour ttes requêtes grâce aux headers -> autorisation certains headers et certaines méthodes (GET,POST..)
//* remplacé par middleware CORS

app.use(express.json());
app.use(cors());

//* cacher mot de passe et nom utilisateur et adresse et nom token
mongoose.connect('mongodb+srv://MatDev:UZFWpCgWhlH79iiz@cluster01.edfqjjd.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

//* enregistrement des routeurs
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;