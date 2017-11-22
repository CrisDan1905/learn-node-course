const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { catchErrors } = require('../handlers/errorHandlers') // con {} se hace desestructuracion y asi se obtiene solo el objeto exportado que se necesita, ningun otro
// Do work here
router.get('/', storeController.myMiddleware, storeController.homePage);

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
})

router.get('/add', storeController.addStore);
router.post('/add', catchErrors(storeController.createStore));

module.exports = router;
