const pickOne = (items) => items[Math.floor(Math.random() * items.length)];

const pickWeighted = (items) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * total;

  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) return item;
  }

  return items[items.length - 1];
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const randomFloat = (min, max) => Math.random() * (max - min) + min;

const randomPastDate = (daysBack = 365) => {
  const now = Date.now();
  const past = now - daysBack * 24 * 60 * 60 * 1000;
  return new Date(randomInt(past, now));
};

const addRandomMinutes = (date, minMinutes, maxMinutes) =>
  new Date(date.getTime() + randomInt(minMinutes, maxMinutes) * 60 * 1000);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

module.exports = {
  addRandomMinutes,
  clamp,
  pickOne,
  pickWeighted,
  randomFloat,
  randomInt,
  randomPastDate,
};
