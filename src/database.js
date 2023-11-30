var mysql = require("mysql2");

const dbConnection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "jaily_db",
}).promise();

module.exports = dbConnection;

