const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');

//* ordre des middle est important: authentification / requête image / etc...
router.get('/', auth, sauceCtrl.getAllThings);
router.post('/', auth, multer, sauceCtrl.createThing);
router.get('/:id', auth, sauceCtrl.getOneThing);
router.put('/:id', auth, multer, sauceCtrl.modifyThing);
router.delete('/:id', auth, sauceCtrl.deleteThing);

module.exports = router;