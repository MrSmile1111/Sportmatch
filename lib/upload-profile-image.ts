import type { ProfileImageKind } from "@/lib/profile-media";

const UPLOAD_ERROR = "Tải ảnh lên thất bại. Vui lòng thử lại.";

/**
 * Upload ảnh đại diện / ảnh bìa (đã crop) lên `/api/profile/images` và trả về
 * URL ảnh mới. Ném lỗi (message tiếng Việt) nếu thất bại.
 */
export async function uploadProfileImage(
  kind: ProfileImageKind,
  blob: Blob,
): Promise<string> {
  const form = new FormData();
  form.append("kind", kind);
  form.append("file", blob, `${kind}.${blob.type.split("/")[1] ?? "img"}`);

  let response: Response;
  try {
    response = await fetch("/api/profile/images", { method: "POST", body: form });
  } catch {
    throw new Error(UPLOAD_ERROR);
  }

  const body: { url?: string; error?: string } | null = await response
    .json()
    .catch(() => null);
  if (!response.ok || !body?.url) throw new Error(body?.error ?? UPLOAD_ERROR);
  return body.url;
}
