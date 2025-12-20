const express = require("express");
const mysql = require("mysql2"); // Using mysql2 for better support
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

let db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Siddhu@2021",
  multipleStatements: true, // Allow multiple queries at once
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL Server.");
});

let currentDatabase = null; // Track current selected database

// Function to format MySQL CLI-like output
const formatOutput = (result, startTime) => {
  let executionTime = ((Date.now() - startTime) / 1000).toFixed(2); // Convert ms to sec
  if (result.affectedRows !== undefined) {
    return `Query OK, ${result.affectedRows} row(s) affected (${executionTime} sec)`;
  } else if (result.length > 0) {
    // Format rows of data for SELECT queries into table format
    const headers = Object.keys(result[0]);
    const data = result.map((row) => {
      // Ensure each column value in the row is aligned properly
      return headers.map((header) => row[header]).join(" | ");
    });

    // Join the headers with newline and then the rows below
    return `${headers.join(" | ")}\n${data.join("\n")}`;
  }
  return `Query executed in ${executionTime} sec`;
};

// API to execute SQL queries
app.post("/run-query", async (req, res) => {
  // let { query } = req.body;
  let query = req.body.code;
  let startTime = Date.now(); // Track execution time

  if (query.trim().toUpperCase().startsWith("USE")) {
    // Extract database name and trim extra spaces
    let dbName = query.split(" ")[1].replace(";", "").trim(); 

    // Switch database
    db = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "vmgupta",
      database: dbName,
      multipleStatements: true,
    });

    db.connect((err) => {
      if (err) {
        return res.json({ output: `ERROR: ${err.message}` });
      }
      currentDatabase = dbName;
      return res.json({ output: `Database changed` });
    });

    return;
  }

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      return res.json({ output: `ERROR ${err.errno} (${err.sqlState}): ${err.sqlMessage}` });
    }

    let output = Array.isArray(results)
      ? formatOutput(results, startTime)
      : formatOutput(results, startTime);

    res.json({ output });
  });
});

// Start the server
app.listen(5000, () => {
  console.log("MySQL Server running on port 5000");
});
