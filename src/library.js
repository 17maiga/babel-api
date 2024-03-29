function validateText(text) {
  if (text === undefined || text === null) return "Missing parameter: text.";
  if (text.length > PAGE_LEN) return "Invalid parameter: text is too long.";
  if (text.length === 0) return "Invalid parameter: text is empty.";
  if (!/^[a-z ,.]+$/.test(text))
    return (
      "Invalid parameter: text can only contain the following characters: " +
      allowedChars
    );
  return null;
}

function validateAddress(room, wall, shelf, volume, page) {
  let missing = [];
  if (room === undefined || room === null) missing.push("room");
  if (wall === undefined || wall === null) missing.push("wall");
  if (shelf === undefined || shelf === null) missing.push("shelf");
  if (volume === undefined || volume === null) missing.push("volume");
  if (page === undefined || page === null) missing.push("page");
  if (missing.length > 0) return "Missing parameters: " + missing.join(", ");
  if (!/^[A-Z0-9]+$/.test(room))
    return "Invalid parameter: room must be a string of uppercase letters and numbers.";
  if (Number.isNaN(wall) || wall < 0 || wall > 3)
    return "Invalid parameter: wall must be a number between 0 and 3.";
  if (Number.isNaN(shelf) || shelf < 0 || shelf > 4)
    return "Invalid parameter: shelf must be a number between 0 and 4.";
  if (Number.isNaN(volume) || volume < 0 || volume > 31)
    return "Invalid parameter: volume must be a number between 0 and 31.";
  if (Number.isNaN(page) || page < 0 || page > 409)
    return "Invalid parameter: page must be a number between 0 and 409.";
  return null;
}

function validateTitle(title) {
  if (title === undefined || title === null) return "Missing parameter: title.";
  if (title.length > TITLE_LEN) return "Invalid parameter: title is too long.";
  if (title.length === 0) return "Invalid parameter: title is empty.";
  if (!/^[a-z ,.]+$/.test(title))
    return (
      "Invalid parameter: title can only contain the following characters: " +
      allowedChars
    );
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
let digs = "abcdefghijklmnopqrstuvwxyz, .aeiouy ";
let allowedChars = "abcdefghijklmnopqrstuvwxyz, .";

function search(search_str) {
  let wall = "" + parseInt(Math.random() * 3 + 1);
  let shelf = "" + parseInt(Math.random() * 4 + 1);
  let volume = pad("" + parseInt(Math.random() * 31 + 1), 2);
  let page = pad("" + parseInt(Math.random() * 409 + 1), 3);
  let locHash = hashCode(wall + shelf + volume + page);
  let hex = "";
  let depth = parseInt(Math.random() * (PAGE_LEN - search_str.length));
  for (let x = 0; x < depth; x++) {
    search_str = digs[parseInt(Math.random() * digs.length)] + search_str;
  }
  seed = Math.abs(locHash);
  for (let i = 0; i < search_str.length; i++) {
    let index = digs.indexOf(search_str[i]);
    let rand = seededRandom(0, digs.length);
    let newIndex = (index + parseInt(rand)).mod(an.length);
    let newChar = an[newIndex];
    hex += newChar;
  }
  return {
    room: hex,
    wall: wall,
    shelf: shelf,
    volume: parseInt(volume),
    page: parseInt(page),
  };
}

function getPage(room, wall, shelf, volume, page) {
  let locHash = hashCode(
    wall + shelf + pad("" + volume, 2) + pad("" + page, 3)
  );
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
  while (result.length < PAGE_LEN) {
    let index = parseInt(seededRandom(0, digs.length));
    result += digs[index];
  }
  return { page: result.slice(result.length - PAGE_LEN) };
}

function getWall(room, wall) {
  let res = {};
  for (let shelf = 0; shelf < 5; shelf++) {
    res[shelf] = {};
    for (let volume = 0; volume < 32; volume++) {
      res[shelf][volume] = getTitle(room, wall, shelf, volume);
    }
  }
  return { wall: res };
}

function getTitle(room, wall, shelf, volume) {
  let hex = room;
  let locHash = hashCode(wall + shelf + pad(volume, 2) + 4);
  seed = Math.abs(locHash);
  let result = "";
  for (let i = 0; i < hex.length; i++) {
    let index = an.indexOf(hex[i]);
    let rand = seededRandom(0, an.length);
    let newIndex = (index - parseInt(rand)).mod(digs.length);
    let newChar = digs[newIndex];
    result += newChar;
  }
  seed = Math.abs(hashCode(result));
  while (result.length < TITLE_LEN) {
    let index = parseInt(seededRandom(0, digs.length));
    result += digs[index];
  }
  return { title: result.slice(result.length - TITLE_LEN) };
}

function searchTitle(search_str) {
  let wall = "" + parseInt(Math.random() * 3 + 1);
  let shelf = "" + parseInt(Math.random() * 4 + 1);
  let volume = pad("" + parseInt(Math.random() * 31 + 1), 2);
  let locHash = hashCode(wall + shelf + volume + 4);
  let hex = "";
  search_str = search_str.slice(0, TITLE_LEN);
  while (search_str.length < TITLE_LEN) {
    search_str += " ";
  }
  seed = Math.abs(locHash);
  for (let i = 0; i < search_str.length; i++) {
    let index = digs.indexOf(search_str[i]);
    let rand = seededRandom(0, digs.length);
    let newIndex = (index + parseInt(rand)).mod(an.length);
    let newChar = an[newIndex];
    hex += newChar;
  }
  return {
    room: hex,
    wall: wall,
    shelf: shelf,
    volume: parseInt(volume).toString(),
    page: "0",
  };
}

module.exports = {
  validateAddress,
  validateText,
  validateTitle,
  page_len: PAGE_LEN,
  title_len: TITLE_LEN,
  allowedChars,
  search,
  getPage,
  getWall,
  searchTitle,
  getTitle,
};
