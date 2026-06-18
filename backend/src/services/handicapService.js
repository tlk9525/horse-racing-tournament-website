// Chuyển đổi giá trị sang số, trả về fallback nếu giá trị null, undefined, rỗng hoặc không phải số hữu hạn
export const numeric = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Giới hạn giá trị trong khoảng [min, max]; nếu max <= 0 thì chỉ áp dụng giới hạn dưới
export const clamp = (value, min, max) => {
  if (max > 0) return Math.min(max, Math.max(min, value));
  return Math.max(min, value);
};

// Tính điểm tổng hợp của ngựa dựa trên tốc độ (40%), sức bền (25%), phong độ (20%), và sức khỏe (15%)
export const horseOverallRating = (horse = {}) => {
  const speed = numeric(horse.speedRating, 75);
  const stamina = numeric(horse.staminaRating, 75);
  const form = numeric(horse.formRating, 75);
  const health = numeric(horse.healthRating, 80);

  return Number(
    (speed * 0.4 + stamina * 0.25 + form * 0.2 + health * 0.15).toFixed(2)
  );
};

// Tính phần điều chỉnh handicap dựa trên điểm tổng hợp, lấy chuẩn 75 điểm làm gốc
export const ratingHandicapAdjustment = (rating) =>
  Number(((numeric(rating, 75) - 75) * 0.2).toFixed(2));

// Tính handicap cuối cùng cho cuộc đua dựa trên điểm ngựa, cân nặng jockey và giới hạn của race
export const computeRaceHandicap = (horse, jockeyProfile, race) => {
  const rating = horseOverallRating(horse);
  const base = numeric(horse?.baseHandicap, 0);
  const jockeyWeight = numeric(jockeyProfile?.weight, 0);
  const jockeyWeightAdjustment = jockeyWeight
    ? Number(((jockeyWeight - 54) * 0.1).toFixed(2))
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
