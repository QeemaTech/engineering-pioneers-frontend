import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchWishlist() {
  const res = await client.get(endpoints.student.wishlist);
  return res?.data?.data ?? [];
}

export async function addToWishlist(courseId) {
  const res = await client.post(endpoints.student.wishlistItem(courseId));
  return res?.data?.data ?? null;
}

export async function removeFromWishlist(courseId) {
  await client.delete(endpoints.student.wishlistItem(courseId));
}
