const convertUrlsToArrays = require("./convertUrlsToArrays");

const urlsToScrap = convertUrlsToArrays("url.txt");

const scraperObject = {
  url: "https://howlongtobeat.com/#search",
  async scraper(browser) {
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let newPage = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await newPage.goto(link);
        await newPage.waitForSelector(".search_list");
        console.log("wait for page to fully load");
        await newPage.waitForTimeout(2000);
        console.log("ok let's go");

        // Get the link to all the required books
        let urls = await newPage.$$eval(
          "#global_search .search_list_details h3 a",
          (links) => {
            console.log("links", links);
            return links.map((link) => {
              return link.href;
            });
          }
        );
        writeFile(urls);
        resolve(urls);
        await newPage.close();
      });
    for (link in urlsToScrap) {
      let currentPageData = await pagePromise(urlsToScrap[link]);
      console.log(currentPageData);
    }
  },
};

module.exports = scraperObject;
