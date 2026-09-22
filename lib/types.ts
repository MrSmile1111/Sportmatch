export type Sport = {
  id: string;
  slug: string;
  name: string;
  icon: string;
};

export const SKILL_LEVELS = ["Mới chơi", "Trung cấp", "Chuyên nghiệp"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const WEEKDAYS = [
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
  "Chủ nhật",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export type Gender = "Nam" | "Nữ" | "Khác";

export type UserSport = {
  sportId: string;
  skillLevel: SkillLevel;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  area: string;
  lat: number;
  lng: number;
  gender: Gender;
  birthday: string;
  trustScore: number;
  isOnline: boolean;
  isPro: boolean;
  distanceKm: number;
  sports: UserSport[];
  availability: Weekday[];
  matchCount: number;
  averageStars: number;
  ratingCount: number;
  communityVotes: number;
  createdAt: string;
};

export type MatchVisibility = "Công khai" | "Theo lời mời" | "Riêng tư";
export type MatchStatus = "Sắp diễn ra" | "Đang diễn ra" | "Đã hoàn tất";
export type SkillRequirement = SkillLevel | "Bất kỳ";

export type MatchParticipant = {
  userId: string;
  status: "invited" | "requested" | "joined" | "left";
};

/** Quan hệ của người đang xem với một trận. */
export type ViewerRole = "host" | "joined" | "invited" | "requested" | "none";

export type Match = {
  id: string;
  sportId: string;
  hostId: string;
  title: string;
  courtName: string;
  address: string;
  dateTime: string;
  maxPlayers: number;
  skillRequirement: SkillRequirement;
  visibility: MatchVisibility;
  description: string;
  status: MatchStatus;
  participants: MatchParticipant[];
};

export type Court = {
  id: string;
  name: string;
  area: string;
  address: string;
  sportIds: string[];
  pricePerHour: number;
  phone: string;
  isOpen: boolean;
  lat: number;
  lng: number;
};

export type Rating = {
  id: string;
  fromUserId: string;
  toUserId: string;
  matchId: string;
  stars: number;
  comment: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: "invite" | "join" | "rating" | "system";
  title: string;
  body: string;
  /** Trận liên quan (lời mời, yêu cầu tham gia...) để thông báo link tới. */
  matchId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  matchId: string;
  participantIds: string[];
  lastMessageAt: string;
};

export const WEEKDAY_SHORT: Record<Weekday, string> = {
  "Thứ hai": "T2",
  "Thứ ba": "T3",
  "Thứ tư": "T4",
  "Thứ năm": "T5",
  "Thứ sáu": "T6",
  "Thứ bảy": "T7",
  "Chủ nhật": "CN",
};
