// Ielādē pielaiko-partiju/pp-data.js (pārlūka IIFE, kas raksta window.PP) Node vidē.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const WEB = path.join(ROOT, "pielaiko-partiju");
const win = {};
new Function("window", fs.readFileSync(path.join(WEB, "pp-data.js"), "utf8"))(win);
module.exports = { PP: win.PP, ROOT, WEB };
