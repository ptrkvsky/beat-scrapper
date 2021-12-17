const convertUrlsToArrays = require("./convertUrlsToArrays");
const convertHoursToBdd = require("./convertHoursToBdd");
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
          ".game_times .time_100",
          (timesCol) => {
            timesCol.map((timeCol) => {
              let category = timeCol.querySelector("h5");
              let time = timeCol.querySelector("div");
              if (category) {
                category = category.innerText;
              }
              if (time) {
                time = time.innerText;
              }
              console.log(category, time);
            });
            return timesCol;
            // return timeCol.map((time) => {
            //   console.log(
            //     "time -->",
            //     time.innerText.replace("Hours", "").replace("½", "")
            //   );
            //   return time;
            // });
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
