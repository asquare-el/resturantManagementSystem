require('dotenv').config()
const {Pool} = require('pg')
const pool_conf = require('./src/database/config')
const pool = new Pool(pool_conf['dev']);
module.exports = pool;