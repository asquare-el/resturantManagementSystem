const express = require('express');
require('dotenv').config()
const  router  = express.Router();
const user = require('../controller/user');
const auth = require('../middleware/index');
const {validateRegister,validatelogin,validateAddress} = require('../middleware/validate')


router.post('/register', validateRegister, user.register)
router.post('/login',validatelogin, user.login)
router.post('/address',validateAddress, auth.authenticateToken,user.address)
router.get('/fetch-resturants', auth.authenticateToken, user.fetchResturants)
router.get('/:id/fetch-dishes', auth.authenticateToken, user.fetchDishes)
router.post('/logout', auth.authenticateToken, user.logout)

module.exports = router
