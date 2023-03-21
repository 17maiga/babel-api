"use strict";
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const library = require("./libraryofbabel");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.post("/api/page", (req, res) => {
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
    res.json({ page: library.getPage(room, wall, shelf, volume, page) });
  }
});

app.post("/api/find", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!library.validateText(req.body["text"])) {
    res.status(400);
    res.json({
      error:
        "Invalid text. " +
        'Search text may only contain the following characters: "' +
        library.allowedChars +
        '"',
    });
    return;
  }
  const address = library.search(req.body["text"]);
  const [room, wall, shelf, volume, page] = address.split(":");
  res.json({
    room: room,
    wall: wall,
    shelf: shelf,
    volume: volume,
    page: page,
  });
});

app.post("/api/find-title/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ address: library.searchTitle(req.body["title"]) });
});

app.post("/api/get-title", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!library.validateAddress(req.body["address"])) {
    res.status(400);
    res.json({ error: "Invalid address" });
    return;
  }
  res.json({ title: library.getTitle(req.body["address"]) });
});

app.listen(PORT);

console.log("Server running on port " + PORT);
