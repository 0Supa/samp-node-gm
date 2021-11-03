const config = require('../config.json')
const mariadb = require('mariadb')

const pool = mariadb.createPool(config.database);

exports.query = (sql, values) => pool.query(sql, values)

exports.gm = { playerSpawn: { x: 2095, y: 1430, z: 10, rotation: 90 } }
exports.samp = require("samp-node-lib")

require('./commands')
require('./events')
