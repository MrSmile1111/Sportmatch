-- Chỉ giữ 6 môn phổ biến nhất; các môn còn lại ẩn đi (không xoá để giữ dữ liệu cũ).
UPDATE "Sport" SET "isActive" = false
WHERE "id" NOT IN ('badminton', 'pickleball', 'football', 'tennis', 'table_tennis', 'volleyball');
