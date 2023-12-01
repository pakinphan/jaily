var mysql = require("mysql2");

const dbConnection = mysql.createPool({
  host: "srv479.hstgr.io",
  user: "u149716520_thus_final",
  password: "cZ>K1@Sw85So![x;NK?T~2F0x|R",
  database: "u149716520_thus_final",
}).promise();

module.exports = dbConnection;

