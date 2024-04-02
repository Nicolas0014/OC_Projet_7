const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const stuffCtrl = require('../controllers/stuffController');

router.get('/', stuffCtrl.getAllStuff);
router.post('/', auth, stuffCtrl.createStuff);
router.get('/:id', stuffCtrl.getOneStuff);
router.put('/:id', auth, stuffCtrl.modifyStuff);
router.delete('/:id', auth, stuffCtrl.deleteStuff);

module.exports = router;