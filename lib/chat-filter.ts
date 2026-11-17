// Danh sách ngầm từ tục tĩu / gạ gẫm / tình dục — chỉ dùng phía server, không gửi xuống client.
// Từ có dấu chỉ khớp văn bản gốc; từ không dấu khớp cả bản đã bỏ dấu (bắt "đm" gõ thành "dm").
// Không đưa từ không dấu dễ trùng nghĩa lành (vd "lon" ~ "lớn", "du ma" ~ "dù mà").
// shortcut: không bắt kiểu lách "đ.ị.t" / "đjt"; nâng cấp lên chuẩn hoá ký tự khi bị lách nhiều.
const BANNED = [
  // chửi bậy
  "địt", "đụ", "đéo", "lồn", "buồi", "cặc", "đĩ", "đm", "đmm", "đcm", "dm", "dmm", "dcm", "vcl", "vkl",
  "vl", "clgt", "cmm", "con mẹ mày", "đụ má", "mẹ kiếp", "óc chó", "thằng chó", "súc vật", "dit me",
  "dit con me",
  // tình dục / gạ gẫm
  "chịch", "nện nhau", "làm tình", "lam tinh", "tình dục", "tinh duc", "khỏa thân", "khoả thân",
  "ảnh nóng", "clip nóng", "gạ tình", "ga tinh", "đi khách", "bao đêm", "qua đêm với", "thủ dâm",
  "thu dam", "nứng", "dâm dục", "khiêu dâm", "khieu dam", "mại dâm", "mai dam", "gái gọi", "gai goi",
  "trai bao", "đi nhà nghỉ", "vào nhà nghỉ", "kích dục", "vú to", "show hàng",
  "fuck", "shit", "bitch", "dick", "pussy", "porn", "sex", "nude", "nudes", "horny",
];

const escape = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
const PATTERN = new RegExp(
  `(?<![\\p{L}\\p{N}])(?:${BANNED.map(escape).join("|")})(?![\\p{L}\\p{N}])`,
  "u",
);

const stripAccents = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");

export function hasBannedWords(text: string): boolean {
  const lower = text.normalize("NFC").toLowerCase();
  return PATTERN.test(lower) || PATTERN.test(stripAccents(lower));
}
