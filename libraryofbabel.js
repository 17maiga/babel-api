"use strict";
function validateText(text) {
  if (text === undefined) return "Missing parameter: text";
  for (let i = 0; i < text.length; i++)
    if (digs.indexOf(text[i]) === -1)
      return (
        "invalid character: " +
        text[i] +
        '. Search text may only contain the following characters: "' +
        allowedChars +
        '"'
      );
  return null;
}

function validateAddress(room, wall, shelf, book, page) {
  let missing = [];
  if (room === undefined) missing.push("room");
  if (wall === undefined) missing.push("wall");
  if (shelf === undefined) missing.push("shelf");
  if (book === undefined) missing.push("book");
  if (page === undefined) missing.push("page");
  if (missing.length > 0) return "Missing parameters: " + missing.join(", ");
  if (room === "") return "room cannot be empty";
  if (Number.isNaN(wall) || wall < 0 || wall > 3)
    return "wall must be between 0 and 3";
  if (Number.isNaN(shelf) || shelf < 0 || shelf > 4)
    return "shelf must be between 0 and 4";
  if (Number.isNaN(book) || book < 0 || book > 31)
    return "book must be between 0 and 31";
  if (Number.isNaN(page) || page < 0 || page > 409)
    return "page must be between 0 and 409";
  return null;
}

const PAGE_LEN = 3200;
const TITLE_LEN = 25;

let seed = 6;

function seededRandom(min, max) {
  max = max || 1;
  min = min || 0;

  seed = (seed * 9301 + 49297) % 233280;
  const rnd = seed / 233280;

  return min + rnd * (max - min);
}

function hashCode(s) {
  let hash = 0,
    i,
    chr,
    len;
  if (s.length === 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function pad(s, size) {
  if (typeof s !== "string") s = s.toString();
  while (s.length < size) s = "0" + s;
  return s;
}

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

let an = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// digs must be the same length as an
let digs = "abcdefghijklmnopqrstuvwxyz, .aeiouy ";
let allowedChars = "abcdefghijklmnopqrstuvwxyz, .";

function seedRandomForGen(locHash, room) {
  seed = Math.abs(locHash);
  let result = "";
  for (let i = 0; i < room.length; i++) {
    let index = an.indexOf(room[i]);
    let rand = seededRandom(0, an.length);
    let newIndex = (index - parseInt(rand)).mod(digs.length);
    let newChar = digs[newIndex];
    result += newChar;
  }
  seed = Math.abs(hashCode(result));
  return result;
}

function genHex(locHash, search_str) {
  let hex = "";
  seed = Math.abs(locHash);
  for (let i = 0; i < search_str.length; i++) {
    let index = digs.indexOf(search_str[i]);
    let rand = seededRandom(0, digs.length);
    let newIndex = (index + parseInt(rand)).mod(an.length);
    let newChar = an[newIndex];
    hex += newChar;
  }
  return hex;
}

function search(text) {
  let wall = Math.round(Math.random() * 3 + 1).toString();
  let shelf = Math.round(Math.random() * 4 + 1).toString();
  let book = pad(Math.round(Math.random() * 31 + 1).toString(), 2);
  let page = pad(Math.round(Math.random() * 409 + 1).toString(), 3);
  let locHash = hashCode(wall + shelf + book + page);
  let depth = Math.round(Math.random() * (PAGE_LEN - text.length));
  for (let x = 0; x < depth; x++)
    text = digs[Math.round(Math.random() * digs.length)] + text;
  let hex = genHex(locHash, text);
  return {
    room: hex,
    wall: parseInt(wall),
    shelf: parseInt(shelf),
    book: parseInt(book),
    page: parseInt(page),
  };
}



function getPage(room, wall, shelf, book, page) {
  let locHash = hashCode(wall + shelf + pad(book, 2) + pad(page, 3));
  let result = seedRandomForGen(locHash, room);
  while (result.length < PAGE_LEN) {
    let index = parseInt(seededRandom(0, digs.length));
    result += digs[index];
  }
  return result.slice(result.length - PAGE_LEN);
}

function getTitle(room, wall, shelf, book) {
  let locHash = hashCode(wall + shelf + pad(book, 2) + 4);
  let result = seedRandomForGen(locHash, room);
  while (result.length < TITLE_LEN) {
    let index = parseInt(seededRandom(0, digs.length));
    result += digs[index];
  }
  return result.slice(result.length - TITLE_LEN);
}

function searchTitle(text) {
  const wall = Math.round(Math.random() * 3 + 1).toString();
  const shelf = Math.round(Math.random() * 4 + 1).toString();
  const book = pad(Math.round(Math.random() * 31 + 1).toString(), 2);
  let locHash = hashCode(wall + shelf + book + 4);
  text = text.slice(0, TITLE_LEN);
  while (text.length < TITLE_LEN) {
    text += " ";
  }
  let hex = genHex(locHash, text);
  return [hex, wall, shelf, parseInt(book), 0].join(":");
}

module.exports = {
  validateAddress,
  validateText,
  page_len: PAGE_LEN,
  title_len: TITLE_LEN,
  allowedChars,
  search,
  getPage: getPage,
  searchTitle,
  getTitle,
};
