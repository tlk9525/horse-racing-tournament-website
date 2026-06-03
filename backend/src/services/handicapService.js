export const numeric = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const clamp = (value, min, max) => {
  if (max > 0) return Math.min(max, Math.max(min, value));
  return Math.max(min, value);
};

export const horseOverallRating = (horse = {}) => {
  if (numeric(horse.overallRating, 0) > 0) {
    return Number(numeric(horse.overallRating).toFixed(2));
  }

  const speed = numeric(horse.speedRating, 75);
  const stamina = numeric(horse.staminaRating, 75);
  const form = numeric(horse.formRating, 75);
  const health = numeric(horse.healthRating, 80);

  return Number((speed * 0.4 + stamina * 0.3 + form * 0.2 + health * 0.1).toFixed(2));
};

export const ratingHandicapAdjustment = (rating) => {
  if (rating >= 90) return 2;
  if (rating >= 80) return 1;
  if (rating >= 70) return 0;
  return -1;
};

export const computeRaceHandicap = (horse, jockeyProfile, race) => {
  const rating = horseOverallRating(horse);
  const base = numeric(horse?.baseHandicap, 0);
  const jockeyWeight = numeric(jockeyProfile?.weight, 0);
  const jockeyWeightAdjustment = jockeyWeight
    ? Number(((58 - jockeyWeight) / 2).toFixed(1))
    : 0;
  const rawHandicap =
    base + ratingHandicapAdjustment(rating) + jockeyWeightAdjustment;
  const min = numeric(race?.handicapMin, 0);
  const max = numeric(race?.handicapMax, 0);

  return {
    rating,
    handicap: Number(clamp(rawHandicap, min, max).toFixed(1)),
  };
};
