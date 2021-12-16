const fs = require("fs");

const writeFile = (arrayurl) => {
  arrayurl.forEach((string) => {
    fs.writeFile("url.txt", string + "\n", { flag: "a+" }, (err) => {});
  });
};

module.exports = writeFile;
