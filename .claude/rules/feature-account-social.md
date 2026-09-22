---
paths:
  - "app/(app)/profile/**"
  - "app/(app)/settings/**"
  - "app/(app)/chat/**"
  - "app/(app)/notifications/**"
  - "app/(app)/history/**"
  - "app/(app)/ratings/**"
---

# Hồ sơ, Cài đặt & các trang tương tác

## Hồ sơ cá nhân (Profile)
Header lớn: avatar, tên, khu vực, giới thiệu ngắn, badge môn + trình độ, nút "Sửa hồ sơ". Card "Thống kê" (điểm xếp hạng, tổng trận, điểm uy tín, số đánh giá, điểm đánh giá TB dạng sao). Card "Lịch rảnh". Card "Môn thể thao" (list môn + trình độ). Card "Xếp hạng" lặp lại breakdown công thức điểm như trang Ranking (xem `feature-discover-map-ranking.md`), kèm nút "Xem bảng xếp hạng". Card "Chi tiết uy tín": Độ tin cậy %, Hoàn thành trận %, Đánh giá cộng đồng % (progress bar). Đối chiếu `screencapture-...-main-profile-*.png`.

## Cài đặt tài khoản (Settings)
Sidebar trái 3 mục: Hồ sơ / Thông báo / Bảo mật.
- **Tab Hồ sơ**: đổi ảnh đại diện (avatar hệ thống hoặc upload ≤5MB), thông tin cá nhân (họ tên, khu vực + nút lấy vị trí, giới tính, ngày sinh, bio ngắn), môn thể thao & trình độ (chọn môn + trình độ riêng từng môn), lịch rảnh (7 ngày). Nút "Lưu thay đổi" nổi góc dưới phải.
- **Tab Thông báo / Bảo mật**: chưa có ảnh minh hoạ chi tiết — hỏi lại user hoặc suy luận theo pattern chuẩn (bật/tắt loại thông báo; đổi mật khẩu, 2FA) khi tới lúc implement, và xác nhận lại trước khi chốt layout.

Đối chiếu `screencapture-...-main-settings-*.png`.

## Tin nhắn (Chat)
Trang "Tin nhắn" — realtime, cập nhật tự động. Trạng thái rỗng: "Chưa có hội thoại. Vào trận đấu để chat với chủ trận hoặc team!" + CTA "Xem trận đấu". Khi có hội thoại: chưa có ảnh minh hoạ — dùng layout chuẩn (danh sách hội thoại trái + khung chat phải) nhưng xác nhận lại với user trước khi chốt chi tiết. Đối chiếu `screencapture-...-main-chat-*.png`.

## Lịch sử trận đấu (History)
4 ô thống kê đầu trang: Tổng trận, Đã hoàn tất, Đang diễn ra, Đánh giá TB. Bên dưới là danh sách lịch sử; trạng thái rỗng: "Chưa có lịch sử trận đấu. Tìm trận ngay". Đối chiếu `screencapture-...-main-history-*.png`.

## Thông báo (Notifications)
Trạng thái rỗng: "Chưa có thông báo" + CTA "Khám phá trận đấu". Cấu trúc đọc/chưa đọc khi có dữ liệu thật — hỏi lại user khi implement nếu cần chi tiết chính xác hơn ảnh hiện có. Đối chiếu `screencapture-...-main-notifications-*.png`.

## Đánh giá & nhận xét (Ratings)
Mô tả: "Đánh giá đồng đội sau mỗi trận để xây dựng uy tín cộng đồng." Trạng thái rỗng: "Chưa có trận nào!" + CTA "Tìm trận đấu". Có nút "Làm mới" góc trên phải. Đối chiếu `screencapture-...-main-ratings-*.png`.
