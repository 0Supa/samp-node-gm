const config = require('../config.json')
const mariadb = require('mariadb')

const pool = mariadb.createPool(config.database);

exports.pool = pool

exports.gm = {}
exports.samp = require("samp-node-lib")

require('./commands')
require('./events')
