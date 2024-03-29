"use strict";
const express = require("express");
const path = require("path");
const compression = require("compression");
const helmet = require("helmet");

const library = require("./library");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(helmet());
app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));
app.use(express.static(path.join(__dirname, "../public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/api/get/page", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const room = req.body["room"];
  const wall = req.body["wall"];
  const shelf = req.body["shelf"];
  const volume = req.body["volume"];
  const page = req.body["page"];
  const error = library.validateAddress(room, wall, shelf, volume, page);
  if (error) {
    res.status(400);
    res.json({ error: error });
  } else {
    res.status(200);
    res.json(library.getPage(room, wall, shelf, volume, page));
  }
});

app.post("/api/get/wall", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const room = req.body["room"];
  const wall = req.body["wall"];
  const error = library.validateAddress(room, wall, 0, 0, 0);
  if (error) {
    res.status(400);
    res.json({ error: error });
  } else {
    res.status(200);
    res.json(library.getWall(room, wall));
  }
});

app.post("/api/find/page", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let text = req.body["input"];
  const error = library.validateText(text);
  if (error) {
    res.status(400);
    res.json({ error: error });
  } else {
    if (req.body["exact"] !== undefined && req.body["exact"] === true)
      text = text.padEnd(library.page_len, " ");
    res.status(200);
    res.json(library.search(text));
  }
});

app.post("/api/find/title/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const title = req.body["input"];
  const error = library.validateTitle(title);
  if (error) {
    res.status(400);
    res.json({ error: error });
  } else {
    res.status(200);
    res.json(library.searchTitle(title));
  }
});

app.post("/api/get/title", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const room = req.body["room"];
  const wall = req.body["wall"];
  const shelf = req.body["shelf"];
  const volume = req.body["volume"];
  const error = library.validateAddress(room, wall, shelf, volume, 0);
  if (error) {
    res.status(400);
    res.json({ error: error });
  } else {
    res.status(200);
    res.json(library.getTitle(room, wall, shelf, volume));
  }
});

app.listen(PORT);
console.log("Server running on port " + PORT);
