'use strict';
const express = require("express");
const library = require("./libraryofbabel");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "content": "Hello, world!"
  }));
});

app.get("/read/:address", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "page": library.getPage(req.params["address"])
  }));
});

app.get("/find/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "address": library.search(req.body)
  }));
});

app.get("/find-title/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "address": library.searchTitle(req.body)
  }));
});

app.get("/get-title/:address", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "title": library.getTitle(req.params["address"])
  }));
});

app.listen(PORT);

console.log("Server running on port " + PORT);
