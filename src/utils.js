module.exports.normalizeAmount = (amount) => {
  return parseFloat(amount.toString().replace(/,/g, ''), 10);
};

module.exports.maxObjVal = (obj) => {
  return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
};
