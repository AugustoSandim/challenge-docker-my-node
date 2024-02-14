const express = require("express");
const mysql = require("mysql");
const app = express();

// Database configuration
const config = {
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "nodedb",
};

// Create MySQL connection pool for better performance
const pool = mysql.createPool(config);

// Function to create the people table if it doesn't exist
const createTable = `CREATE TABLE IF NOT EXISTS people (id int not null auto_increment, name varchar(255), primary key(id))`;
pool.query(createTable, (error) => {
  if (error) throw error;
  console.log("Table 'people' is created or already exists");
});

// Handle requests
app.get("/", (req, res) => {
  const name = "User" + Math.floor(Math.random() * 100);
  pool.getConnection((error, connection) => {
    if (error) {
      console.error("Error getting connection from pool:", error);
      return res.status(500).send("Internal Server Error");
    }
    connection.query(
      "INSERT INTO people (name) VALUES (?)",
      [name],
      (error, results) => {
        if (error) {
          console.error("Error inserting into database:", error);
          connection.release(); // Release the connection
          return res.status(500).send("Internal Server Error");
        }
        connection.query("SELECT name FROM people", (error, results) => {
          connection.release(); // Release the connection
          if (error) {
            console.error("Error selecting from database:", error);
            return res.status(500).send("Internal Server Error");
          }
          const names = results.map((result) => result.name);
          const response = `<h1>Full Cycle Rocks!</h1><p>Lista de nomes cadastrados: ${names.join(
            ", "
          )}</p>`;
          res.send(response);
        });
      }
    );
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
