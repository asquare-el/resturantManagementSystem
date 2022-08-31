const express = require('express');
require('dotenv').config()
const  router  = express.Router();
const subadmin = require('../controller/subadmin');
const {checkSubadmin} = require('../middleware/checkSubadmin');
const auth = require('../middleware/index');
const {validatelogin,validateResturant,validateDish} = require('../middleware/validate')

router.post('/login', validatelogin, subadmin.login)
router.post('/add-resturant',validateResturant, auth.authenticateToken, checkSubadmin, subadmin.addResturant)
router.post('/:id/add-dish', validateDish,auth.authenticateToken, checkSubadmin, subadmin.addDish)
router.post('/create-user', validatelogin, auth.authenticateToken, checkSubadmin, subadmin.createUser)
router.post('/fetch-user', auth.authenticateToken, checkSubadmin, subadmin.fetchUser)





module.exports = router
