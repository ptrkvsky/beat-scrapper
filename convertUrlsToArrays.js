const fs = require("fs");

const convertUrlsToArrays = (filePath) => {
  try {
    // read contents of the file
    const data = fs.readFileSync(filePath, "UTF-8");

    // split the contents by new line
    const urls = data.split(/\r?\n/);
    return urls;
  } catch (err) {
    console.error(err);
  }
};

module.exports = convertUrlsToArrays;
