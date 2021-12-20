require("dotenv").config();
const convertUrlsToArrays = require("./convertUrlsToArrays");
const getIgdbInfos = require("./functions/getIgdbInfos");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const urlsToScrap = convertUrlsToArrays("url.txt");

const convertHoursToBdd = (hour) => {
  return hour.replace("Hours", "");
};

const scraperObject = {
  url: urlsToScrap[0],
  async scraper(browser) {
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let newPage = await browser.newPage();
        console.log(`Navigating to ${link}...`);
        await newPage.goto(link);

        // await newPage.waitForSelector(".profile_header_game .profile_header");

        let dataObj = {};
        // Obternir l'id de howlongtobeat
        dataObj["idHltb"] = +link.split("=")[1];
        // Obtenir le titre
        dataObj["name"] = await newPage.$eval(
          ".profile_header_game .profile_header",
          (text) => {
            return text.innerText;
          }
        );
        // Obtenir le nombre de réussite
        dataObj["totalPoll"] = await newPage.$eval(
          ".profile_details ul li:last-child",
          (text) => {
            return +text.innerText
              .replace("Beat", "")
              .replace(".", "")
              .replace("K", "000")
              .trim();
          }
        );
        // Obtenir la description
        dataObj["description"] = await newPage.$$eval(
          ".in.back_primary.shadow_box .profile_info.large",
          (descriptions) => {
            const fullDescription = descriptions.map((description, index) => {
              if (index < 1) {
                return description.innerText.replace("...Read More", "");
              }
              return "";
            });
            return fullDescription.toString();
          }
        );
        // Obtenir le temps
        dataObj["timesCats"] = await newPage.$$eval(
          ".game_times li",
          (timesCatHtml) => {
            const categorysTimes = timesCatHtml.map((timeCatHtml) => {
              let category = timeCatHtml.querySelector("h5");
              let time = timeCatHtml.querySelector("div");
              if (category) {
                category = category.innerText;
              }
              if (time) {
                time = time.innerText
                  .replace("Hours", "")
                  .replace("½", "")
                  .trim();
              }

              return {
                category: category || null,
                time: +time || null,
              };
            });
            return categorysTimes;
          }
        );
        await newPage.waitForTimeout(0);
        await newPage.close();
        resolve(dataObj);
      });
    for (link in urlsToScrap) {
      let gameScrapped = await pagePromise(urlsToScrap[link]);
      // Test si le jeu en vaut la peine

      if (gameScrapped?.timesCats?.length > 1 && gameScrapped?.totalPoll > 30) {
        // Verification si l element est deja en BDD
        console.log("c'est parti pour l'enregistrement");
        const gameFromDataBase = await prisma.game.findUnique({
          where: {
            idHltb: +gameScrapped.idHltb,
          },
        });
        // Si le jeu n'est pas present en bdd
        if (!gameFromDataBase) {
          const igdbInfos = await getIgdbInfos(gameFromDataBase);
          const game = {
            idHltb: gameScrapped.idHltb,
            name: gameScrapped.name,
            description: gameScrapped.description,
            totalPoll: gameScrapped.totalPoll,
            cover: igdbInfos.cover,
            firstReleaseDate: igdbInfos.cover,
            storyline: igdbInfos.storyline,
            summary: igdbInfos.summary,
            rating: igdbInfos.rating,
            genres: igdbInfos.genres,
          };
          gameScrapped.timesCats.forEach((timeCat) => {
            if (timeCat.category === "Main Story") {
              game.timeMainStory = timeCat.time || null;
            }
            if (timeCat.category === "Main + Extras") {
              game.timeMainExtras = timeCat.time || null;
            }
            if (timeCat.category === "Completionist") {
              game.timeCompletionists = timeCat.time || null;
            }
            if (timeCat.category === "All Styles") {
              game.timeAllStyles = timeCat.time || null;
            }
          });

          // Insertion du jeu  en BDD
          const gameInserted = await prisma.game.create({
            data: game,
          });

          console.log("nouveu jeu insere", gameInserted);
        } else if (!gameFromDataBase.cover) {
          const igdbInfos = await getIgdbInfos(gameFromDataBase);
          const gameInserted = await prisma.game.update({
            where: {
              id: gameFromDataBase.id,
            },
            data: {
              cover: igdbInfos.cover,
              firstReleaseDate: igdbInfos.cover,
              storyline: igdbInfos.storyline,
              summary: igdbInfos.summary,
              rating: igdbInfos.rating,
              genres: igdbInfos.genres,
            },
          });

          console.log(
            `le jeu est deja present en bdd mise a jour ${gameInserted}`
          );
        } else {
          console.log(`COVER PRESENT ${gameFromDataBase.name}`);
        }

        // console.log(game);
      } else {
        console.log(
          "NOT SCRAPPED -->",
          gameScrapped?.name,
          gameScrapped?.timesCats,
          gameScrapped?.totalPoll
        );
      }
    }
  },
};

module.exports = scraperObject;
