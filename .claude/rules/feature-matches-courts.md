---
paths:
  - "app/(app)/matches/**"
  - "app/(app)/courts/**"
---

# Trận đấu & Sân bãi

## Trận đấu (Matches) — danh sách
Tab: Công khai / Trận của tôi / Lời mời / Đã tham gia. Có tìm kiếm + lọc theo môn/trình độ + lọc trạng thái (Tất cả / Còn chỗ / Đã đủ). Mỗi card trận gồm: ảnh/icon môn, tên trận, badge "Còn chỗ", tên sân, môn, ngày giờ, địa điểm, quyền riêng tư (Công khai...), progress bar số người/số chỗ, avatar người tham gia, nút "Mời chơi". Đối chiếu `screencapture-...-main-matches-*_18_47.png`.

## Tạo trận đấu (Matches → Create)
Form nhiều bước trên 1 trang, panel "Tóm tắt trận" bên phải cập nhật realtime theo input:

1. **Chọn môn** (Cầu lông/Pickleball)
2. **Địa điểm và thời gian**: tên sân, địa chỉ chi tiết, ngày, giờ
3. **Cài đặt trận**: số người cần (slider), trình độ yêu cầu (Bất kỳ/Mới chơi/Trung cấp/Chuyên nghiệp), quyền hiển thị:
   - *Công khai*: hiển thị trên bảng trận để mọi người gửi yêu cầu tham gia
   - *Theo lời mời*: chỉ người được mời hoặc đã tham gia mới xem được trận
   - *Riêng tư*: tạo nhóm kín, có thể mời thêm người sau
4. **Mời người chơi**: tìm theo tên/khu vực, gợi ý theo môn đã chọn
5. **Mô tả** (textarea tự do)

Nút "Tạo trận" cam nổi bật cuối trang. Đối chiếu `screencapture-...-main-matches-create-*.png`.

## Sân bãi (Courts)
Layout bản đồ (trái, lớn, Leaflet) + danh sách card sân (phải, cuộn): tên sân, khu vực, trạng thái "Mở cửa", giá/giờ, môn thể thao, nút gọi điện & nhắn tin. Filter theo môn (Tất cả/Cầu lông/Pickleball). Bản đồ tự sắp xếp/pin theo vị trí hiện tại. Đối chiếu `screencapture-...-main-courts-*.png`.
