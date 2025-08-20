const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Database setup
const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      product_desc TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      order_date TEXT,
      status TEXT
  )`);
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/add", (req, res) => {
  const { product_name, product_desc, customer_name, customer_email, customer_phone, order_date, status } = req.body;
  db.run(
    `INSERT INTO orders (product_name, product_desc, customer_name, customer_email, customer_phone, order_date, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [product_name, product_desc, customer_name, customer_email, customer_phone, order_date, status],
    () => res.redirect("/records")
  );
});

app.get("/records", (req, res) => {
  db.all("SELECT * FROM orders", (err, rows) => {
    res.render("records", { orders: rows });
  });
});

// Edit record
app.get("/edit/:id", (req, res) => {
  db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, row) => {
    res.render("edit", { order: row });
  });
});

app.post("/edit/:id", (req, res) => {
  const { product_name, product_desc, customer_name, customer_email, customer_phone, order_date, status } = req.body;
  db.run(
    `UPDATE orders SET product_name=?, product_desc=?, customer_name=?, customer_email=?, customer_phone=?, order_date=?, status=? WHERE id=?`,
    [product_name, product_desc, customer_name, customer_email, customer_phone, order_date, status, req.params.id],
    () => res.redirect("/records")
  );
});

// Delete record
app.get("/delete/:id", (req, res) => {
  db.run("DELETE FROM orders WHERE id = ?", [req.params.id], () => {
    res.redirect("/records");
  });
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
