const axios = require(`axios`);
const getHeaders = require("./getHeaders");
const timeStampToDate = require("./timestampToDate");

module.exports = async function getCover(game) {
  const headers = await getHeaders();
  const bodyRequestGameIgdb = `fields name, cover, first_release_date, summary, storyline, genres, rating; search "${game?.name}";`;

  const gamesIgdb = await axios.post(
    `https://api.igdb.com/v4/games/`,
    bodyRequestGameIgdb,
    headers
  );

  const gameIgdbFound = gamesIgdb.data.find(
    (gameIgdb) => gameIgdb.name === game?.name
  );

  const gameIgdb = gameIgdbFound || gamesIgdb.data[0];

  // COVER
  if (gameIgdb) {
    const bodyRequestCoverIgdb = `fields url; where id = ${
      gameIgdb.cover || gamesIgdb.data[0]
    };`;
    try {
      const coverIgdb = await axios.post(
        `https://api.igdb.com/v4/covers/`,
        bodyRequestCoverIgdb,
        headers
      );

      const igdbInfos = {
        cover: coverIgdb.data[0].url.replace("t_thumb", "t_720p"),
        genres: gameIgdb.genres,
        storyline: gameIgdb.storyline,
        summary: gameIgdb.summary,
        rating: Math.round(gameIgdb.rating || 0),
        firstReleaseDate: timeStampToDate(gameIgdb.first_release_date),
      };
      return igdbInfos;
    } catch (error) {
      console.error("erreur igdb");
    }
  }
  return ``;
};
