function getBnbPosition(token0, token1) {
  if (token0 === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
    return 0;
  } else if (token1 === "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c") {
    return 1;
  }

  return -1;
}

module.exports = {
  getBnbPosition: getBnbPosition,
};
