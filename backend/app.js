//* express: framework pour créat° et gest° serveur
//* mongoose: package pour faciliter échanges avec bdd mongoDB (bdd = base de donnée)
//* dotenv: stocker variable hors appli

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const dotenv= require('dotenv').config();

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');

const app = express();

//* middleware général pour ttes requêtes grâce aux headers -> autorisation certains headers et certaines méthodes (GET,POST..)
//* remplacé par middleware CORS

app.use(express.json());
app.use(cors());

//* cacher mot de passe, nom utilisateur, adresse
mongoose.connect(process.env.DB_DATABASE_URL,
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