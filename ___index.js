const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const getTitle = async () => {
  try {
    const response = await axios.get(
      "https://howlongtobeat.com/game.php?id=10025"
    );

    const html = response.data;

    const $ = cheerio.load(html);

    const title = $(".profile_header_game .profile_header").text();

    return title;
  } catch (error) {
    throw error;
  }
};

const getDescription = async () => {
  try {
    const response = await axios.get(
      "https://howlongtobeat.com/game.php?id=10025"
    );

    const html = response.data;

    const $ = cheerio.load(html);

    let description = "";
    $(".profile_info.large").each((_idx, el) => {
      const descriptionHtml = $(el).text();
      // const title = shelf
      //   .find("span.a-size-base-plus.a-color-base.a-text-normal")
      //   .text();

      description += descriptionHtml + " ";
    });

    return description;
  } catch (error) {
    throw error;
  }
};

const getUrls = async (url) => {
  try {
    const response = await axios.get(url);

    const html = response.data;

    const $ = cheerio.load(html);

    const urls = [];

    $(".search_list_details h3 a").each((_idx, el) => {
      const url = $(el).attr("href");

      urls.push(url);
    });

    console.log(url, "urls --> ", urls);
    return urls;
  } catch (error) {
    throw error;
  }
};

const fetchShelves = async () => {
  try {
    const response = await axios.get(
      "https://howlongtobeat.com/game.php?id=10025"
    );

    const html = response.data;

    const $ = cheerio.load(html);

    const shelves = [];

    $(
      "div.sg-col-4-of-12.s-result-item.s-asin.sg-col-4-of-16.sg-col.sg-col-4-of-20"
    ).each((_idx, el) => {
      const shelf = $(el);
      const title = shelf
        .find("span.a-size-base-plus.a-color-base.a-text-normal")
        .text();

      shelves.push(title);
    });

    return shelves;
  } catch (error) {
    throw error;
  }
};

const urlToParse = [];
const start = 1;
const numberToFetch = 10;
for (let index = start; index < start + numberToFetch; index++) {
  urlToParse.push("https://howlongtobeat.com/#search" + index);
}

// const promises = urlToParse.map((url) => getUrls(url));
// console.log(urlToParse);

// Promise.all(promises)
//   .then((values) => {
//     // console.log("promise", values);
//     // values.forEach((value) =>
//     //   value.forEach((string) => {
//     //     fs.writeFile(
//     //       "url.txt",
//     //       "https://howlongtobeat.com/" + string + "\n",
//     //       { flag: "a+" },
//     //       (err) => {}
//     //     );
//     //   })
//     // );
//   })
//   .catch((error) => {
//     console.log(error);
//   });

getUrls("https://howlongtobeat.com/#search4").then((title) =>
  console.log("title", title)
);
