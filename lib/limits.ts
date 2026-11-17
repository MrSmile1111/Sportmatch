/** Giới hạn mỗi ngày của tài khoản miễn phí. */
export const DAILY_INVITE_LIMIT = 5;
export const DAILY_MATCH_LIMIT = 1;

export const DAILY_LIMIT_MESSAGE =
  "Bạn đã hết lượt trong ngày. Hãy nâng cấp lên bản Pro để mở khoá thêm lượt.";

const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // Việt Nam UTC+7, không đổi giờ
const DAY_MS = 24 * 60 * 60 * 1000;

/** 00:00 hôm nay theo giờ Việt Nam. */
export function startOfTodayVN(now = Date.now()): Date {
  return new Date(Math.floor((now + VN_OFFSET_MS) / DAY_MS) * DAY_MS - VN_OFFSET_MS);
}
