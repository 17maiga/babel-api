'use strict';
const express = require("express");
const library = require("./libraryofbabel");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/page/:address", (req, res) => {
  if (!library.validateAddress(req.params["address"])) {
    res.status(400);
    res.send(JSON.stringify({"error": "Invalid address"}));
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "page": library.getPage(req.params["address"])
  }));
});

app.get("/api/find/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "address": library.search(req.body)
  }));
});

app.get("/api/find-title/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "address": library.searchTitle(req.body)
  }));
});

app.get("/api/get-title/:address", (req, res) => {
  if (!library.validateAddress(req.params["address"])) {
    res.status(400);
    res.send(JSON.stringify({"error": "Invalid address"}));
    return;
  }
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify({
    "title": library.getTitle(req.params["address"])
  }));
});

app.listen(PORT);

console.log("Server running on port " + PORT);
