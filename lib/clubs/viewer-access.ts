export type ClubMembershipState = "PENDING" | "APPROVED" | "REJECTED";

export type PendingClubRequest = {
  userId: string;
  name: string;
  avatar: string;
  area: string;
};

export type ClubViewerAccess = {
  isPersisted: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  displayName: string;
  isOwner: boolean;
  membershipStatus: ClubMembershipState | null;
  pendingRequests: PendingClubRequest[];
};
