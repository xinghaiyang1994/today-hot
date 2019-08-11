const mysql = require('mysql')

const { database } = require('../config/default')

const pool = mysql.createPool(database)

module.exports = function (sql, values) {
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (err, connection) {      
            if (err) {
                reject(err)
            } else {
                connection.query(sql, values, function (err, res, fields) {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(res)
                    }
                    connection.release()
                })
            }
        })
    })
}