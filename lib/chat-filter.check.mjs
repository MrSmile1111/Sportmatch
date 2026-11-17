// Tự kiểm tra bộ lọc: node lib/chat-filter.check.mjs
import assert from "node:assert/strict";
import { hasBannedWords } from "./chat-filter.ts";

for (const bad of ["Địt mẹ", "vcl luôn", "dm", "đi nhà nghỉ không em", "LÀM   TÌNH", "fuck!"]) {
  assert.equal(hasBannedWords(bad), true, bad);
}
for (const ok of ["Sân lớn quá", "dù mà trời mưa", "anh nóng tính ghê", "Dmitri", "sexy", "7h tối nay nhé"]) {
  assert.equal(hasBannedWords(ok), false, ok);
}
console.log("chat-filter ok");
