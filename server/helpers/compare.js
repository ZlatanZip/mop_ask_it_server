function compare(a, b) {
  const aValue = a.numberOfAnswers;
  const bValue = b.numberOfAnswers;

  let comparison = 0;
  if (aValue > bValue) {
    comparison = -1;
  } else if (aValue < bValue) {
    comparison = 1;
  }
  return comparison;
}

module.exports = compare;
