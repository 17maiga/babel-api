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

app.post("/api/get-page", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const error = library.validateAddress(
    req.body["room"],
    req.body["wall"],
    req.body["shelf"],
    req.body["volume"],
    req.body["page"]
  );
  if (error !== null) {
    res.status(400);
    res.json({ error: error });
    return;
  }
  res.status(200);
  res.json({
    page: library.getPage(
      req.body["room"],
      req.body["wall"],
      req.body["shelf"],
      req.body["volume"],
      req.body["page"]
    ),
  });
});

app.post("/api/find-page", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  let text = req.body["text"];
  const error = library.validateText(text);
  if (error !== null) {
    res.status(400);
    res.json({ error: error });
    return;
  }
  if (req.body["exact"] === true)
    text = text.padEnd(library.page_len, " ");
  res.status(200);
  res.json(library.search(text));
});

app.post("/api/get-title/:address", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (!library.validateAddress(req.params["address"])) {
    res.status(400);
    res.send(JSON.stringify({ error: "Invalid address" }));
    return;
  }
  res.json({ title: library.getTitle(req.params["address"]) });
});

app.post("/api/find-title/", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json({ address: library.searchTitle(req.body) });
});

app.listen(PORT);
console.log(`Running on http://localhost:${PORT}`);
