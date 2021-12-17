const convertUrlsToArrays = require("./convertUrlsToArrays");
const convertHoursToBdd = require("./convertHoursToBdd");
const urlsToScrap = convertUrlsToArrays("url.txt");

const scraperObject = {
  url: urlsToScrap[0],
  async scraper(browser) {
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let newPage = await browser.newPage();
        console.log(`Navigating to ${link}...`);
        await newPage.goto(link);
        await newPage.waitForSelector(".game_times");
        await newPage.waitForSelector(".profile_header_game .profile_header");
        let dataObj = {};
        // Obtenir le titre
        dataObj["title"] = await newPage.$eval(
          ".profile_header_game .profile_header",
          (text) => text.innerText
        );
        // Obtenir la description
        dataObj["description"] = await newPage.$$eval(
          ".in.back_primary.shadow_box .profile_info.large",
          (descriptions) => {
            const fullDescription = descriptions.map((description, index) => {
              if (index < 2) {
                return description.innerText.replace("...Read More", "");
              }
              return "";
            });
            return fullDescription;
          }
        );
        // Obtenir le temps
        dataObj["timeCat"] = await newPage.$$eval(
          ".game_times .time_100",
          (timesCatHtml) => {
            const categorysTimes = timesCatHtml.map((timeCatHtml) => {
              let category = timeCatHtml.querySelector("h5");
              let time = timeCatHtml.querySelector("div");
              if (category) {
                category = category.innerText;
              }
              if (time) {
                time = time.innerText;
              }

              return {
                category: category || null,
                time: time || null,
              };
            });
            return categorysTimes;
          }
        );
        await newPage.waitForTimeout(4000);
        await newPage.close();
        resolve(dataObj);
      });
    for (link in urlsToScrap) {
      let currentPageData = await pagePromise(urlsToScrap[link]);
      console.log("CURRENT PAGE DATA -->", currentPageData);
    }
  },
};

module.exports = scraperObject;
