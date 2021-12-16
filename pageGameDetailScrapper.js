const convertUrlsToArrays = require("./convertUrlsToArrays");

const urlsToScrap = convertUrlsToArrays("url.txt");

const scraperObject = {
  url: "https://howlongtobeat.com/#search",
  async scraper(browser) {
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let newPage = await browser.newPage();
        console.log(`Navigating to ${link}...`);
        await newPage.goto(link);
        await newPage.waitForSelector(".game_times");

        // Get the link to all the required books
        let times = await newPage.$$eval(
          ".game_times .time_100 div",
          (times) => {
            console.log("links", times);
            return times.map((time) => {
              console.log("time -->", time.innerText);
              return time;
            });
          }
        );
        await newPage.waitForTimeout(5000);
        console.log(times);
        resolve(times);
        await newPage.close();
      });
    for (link in urlsToScrap) {
      let currentPageData = await pagePromise(urlsToScrap[link]);
      console.log(currentPageData);
    }
  },
};

module.exports = scraperObject;
