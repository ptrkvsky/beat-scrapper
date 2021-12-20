const timeStampToDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDay();

  return `${day}/${month}/${year}`;
};

module.exports = timeStampToDate;
