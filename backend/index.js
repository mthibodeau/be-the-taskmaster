const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3001

const app = express();

app.get("/abc", (req, res) => {
  res.json({ message: "123" });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}...`);
});