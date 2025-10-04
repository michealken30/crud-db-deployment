// src/index.js
const express = require("express");
const bodyParser = require("body-parser");
const { init } = require("./db");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

async function start() {
  const pool = await init();

  app.get("/health", (req, res) => res.json({ status: "ok" }));

  // List users
  app.get("/users", async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, created_at FROM users ORDER BY id DESC"
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Get single user
  app.get("/users/:id", async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        [req.params.id]
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Not found" });
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  // Create
  app.post("/users", async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "name and email required" });

    try {
      const [result] = await pool.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email]
      );
      const [rows] = await pool.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        [result.insertId]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      if (err.code === "ER_DUP_ENTRY")
        return res.status(409).json({ error: "email already exists" });
      res.status(500).json({ error: "Database error" });
    }
  });

  // Update
  app.put("/users/:id", async (req, res) => {
    const { name, email } = req.body;
    try {
      const [result] = await pool.query(
        "UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?",
        [name, email, req.params.id]
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Not found" });
      const [rows] = await pool.query(
        "SELECT id, name, email, created_at FROM users WHERE id = ?",
        [req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      console.error(err);
      if (err.code === "ER_DUP_ENTRY")
        return res.status(409).json({ error: "email already exists" });
      res.status(500).json({ error: "Database error" });
    }
  });

  // Delete
  app.delete("/users/:id", async (req, res) => {
    try {
      const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
        req.params.id,
      ]);
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Not found" });
      res.status(204).end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Database error" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log("DB config:", {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME ? process.env.DB_NAME : null,
    });
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
