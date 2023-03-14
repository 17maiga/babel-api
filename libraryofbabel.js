function validateText(text) {
  for (let i = 0; i < text.length; i++)
    if (digs.indexOf(text[i]) === -1) return false;
  return true;
}

function validateAddress(address) {
  let a = address.split(":");
  if (a.length !== 5) return false;
  if (Number.isNaN(a[1]) || a[1] < 0 || a[1] > 3) return false;
  if (Number.isNaN(a[2]) || a[2] < 0 || a[2] > 4) return false;
  if (Number.isNaN(a[3]) || a[3] < 0 || a[3] > 31) return false;
  return !(Number.isNaN(a[4]) || a[4] < 0 || a[4] > 409);
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

function search(search_str) {
  // randomly generate location numbers
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
  // hash of loc will be used to create a seeded RNG
  seed = Math.abs(locHash);
  for (let i = 0; i < search_str.length; i++) {
    let index = digs.indexOf(search_str[i]);
    //for each calculated value of the rng, it will be added to the index value and modded to len of an
    let rand = seededRandom(0, digs.length);
    let newIndex = (index + parseInt(rand)).mod(an.length);
    let newChar = an[newIndex];
    //hex will be built from the indexes translated into an
    hex += newChar;
  }
  return (
    hex +
    ":" +
    wall +
    ":" +
    shelf +
    ":" +
    parseInt(volume) +
    ":" +
    parseInt(page)
  );
}

function getPage(address) {
  //for each char of hex, it will be turned into the index value in the "an" string
  let addressArray = address.split(":");
  let hex = addressArray[0];
  let locHash = hashCode(
    addressArray[1] +
      addressArray[2] +
      pad(addressArray[3], 2) +
      pad(addressArray[4], 3)
  );
  //hash of loc will be used to create a seeded RNG
  seed = Math.abs(locHash);
  let result = "";
  for (let i = 0; i < hex.length; i++) {
    let index = an.indexOf(hex[i]);
    //for each calculated value of the rng, it will be subtracted from the index value and modded to len of digs
    let rand = seededRandom(0, an.length);
    let newIndex = (index - parseInt(rand)).mod(digs.length);
    let newChar = digs[newIndex];
    //document will be built from the indexes translated into digs
    result += newChar;
  }
  //any leftover space will be filled with random numbers seeded by the hash of the result so far
  seed = Math.abs(hashCode(result));
  while (result.length < PAGE_LEN) {
    let index = parseInt(seededRandom(0, digs.length));
    result += digs[index];
  }
  return result.slice(result.length - PAGE_LEN);
}

function getTitle(address) {
  let addressArray = address.split(":");
  let hex = addressArray[0];
  let locHash = hashCode(
    addressArray[1] + addressArray[2] + pad(addressArray[3], 2) + 4
  );
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
  return result.slice(result.length - TITLE_LEN);
}

function searchTitle(search_str) {
  //randomly generate location numbers
  let wall = "" + parseInt(Math.random() * 3 + 1);
  let shelf = "" + parseInt(Math.random() * 4 + 1);
  let volume = pad("" + parseInt(Math.random() * 31 + 1), 2);
  let locHash = hashCode(wall + shelf + volume + 4);
  let hex = "";
  search_str = search_str.slice(0, TITLE_LEN);
  while (search_str.length < TITLE_LEN) {
    search_str += " ";
  }
  //hash of loc will be used to create a seeded RNG
  seed = Math.abs(locHash);
  for (var i = 0; i < search_str.length; i++) {
    let index = digs.indexOf(search_str[i]);
    //for each calculated value of the rng, it will be added to the index value and modded to len of an
    let rand = seededRandom(0, digs.length);
    let newIndex = (index + parseInt(rand)).mod(an.length);
    let newChar = an[newIndex];
    //hex will be built from the indexes translated into an
    hex += newChar;
  }
  return hex + ":" + wall + ":" + shelf + ":" + parseInt(volume);
}

module.exports = {
  validateAddress,
  validateText,
  page_len: PAGE_LEN,
  title_len: TITLE_LEN,
  allowedChars,
  search,
  getPage,
  searchTitle,
  getTitle,
};
