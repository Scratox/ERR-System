"use strict";

var mysql = require('mysql');

var db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'examination_rectifier',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
db.connect(function (err) {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database');
  }
});
module.exports = db;
//# sourceMappingURL=db.dev.js.map
