const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const users = require("./MOCK_DATA.json");

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ROUTES

// HTML route - list users
app.get("/users", (req, res) => {
  const html = `
    <ul>
      ${users.map(user => `<li>${user.first_name}</li>`).join('')}
    </ul>
  `;
  res.send(html);
});

// API: Get all users
app.get("/api/users", (req, res) => {
  return res.json(users);
});

// API: Get, Delete, or Update a user by ID
app.route("/api/users/:id")
  .get((req, res) => {
    const id = Number(req.params.id);
    const foundUser = users.find(user => user.id === id);
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(foundUser);
  })
  .delete((req, res) => {
    const id = Number(req.params.id);
    const updatedUsers = users.filter(user => user.id !== id);

    fs.writeFile(path.join(__dirname, "MOCK_DATA.json"), JSON.stringify(updatedUsers, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to delete user" });
      return res.json({ request: "deleted" });
    });
  })
  .patch((req, res) => {
    const id = Number(req.params.id);
    const body = req.body;

    const updatedUsers = users.map(user =>
      user.id === id ? { ...user, ...body } : user
    );

    fs.writeFile(path.join(__dirname, "MOCK_DATA.json"), JSON.stringify(updatedUsers, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Failed to update user" });
      return res.json({ request: "updated" });
    });
  });

// API: Add new user
app.post("/api/users", (req, res) => {
  const body = req.body;

  if (!body.first_name || !body.last_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newUser = { ...body, id: users.length + 1 };
  const updatedUsers = [...users, newUser];

  fs.writeFile(path.join(__dirname, "MOCK_DATA.json"), JSON.stringify(updatedUsers, null, 2), (err) => {
    if (err) return res.status(500).json({ error: "Failed to add user" });
    return res.json({ request: "added", id: newUser.id });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
