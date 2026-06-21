import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchFaqs() {
  const response = await client.get(`${endpoints.admin.cms}/faq`);
  return response?.data?.data || [];
}

export async function addFaqItem(body) {
  const response = await client.post(`${endpoints.admin.cms}/faq`, body);
  return response?.data?.data;
}

export async function updateFaqItem({ id, body }) {
  const response = await client.patch(`${endpoints.admin.cms}/faq/${id}`, body);
  return response?.data?.data;
}

export async function fetchSections() {
  const response = await client.get(`${endpoints.admin.cms}/sections`);
  return response?.data?.data || [];
}

export async function createSection(body) {
  const response = await client.post(`${endpoints.admin.cms}/sections`, body);
  return response?.data?.data;
}

export async function updateSection({ id, body }) {
  const response = await client.patch(`${endpoints.admin.cms}/sections/${id}`, body);
  return response?.data?.data;
}

export async function updateAboutUs(body) {
  const response = await client.patch(`${endpoints.admin.cms}/about-us`, body);
  return response?.data?.data;
}

export async function updateHero(body) {
  const response = await client.patch(`${endpoints.admin.cms}/hero`, body);
  return response?.data?.data;
}

export async function fetchPosts(params = {}) {
  const response = await client.get(`${endpoints.admin.cms}/posts`, { params });
  const data = response?.data?.data;
  return data?.posts || data || [];
}

export async function createPost(body) {
  const response = await client.post(`${endpoints.admin.cms}/posts`, body);
  return response?.data?.data;
}

export async function updatePost(id, body) {
  const response = await client.patch(`${endpoints.admin.cms}/posts/${id}`, body);
  return response?.data?.data;
}

export async function deletePost(id) {
  await client.delete(`${endpoints.admin.cms}/posts/${id}`);
}

export async function fetchBanners() {
  const response = await client.get(`${endpoints.admin.cms}/banners`);
  const data = response?.data?.data;
  return data?.banners || (Array.isArray(data) ? data : []);
}


export async function createBanner(body) {
  const response = await client.post(`${endpoints.admin.cms}/banners`, body);
  return response?.data?.data;
}

export async function updateBanner(id, body) {
  const response = await client.patch(`${endpoints.admin.cms}/banners/${id}`, body);
  return response?.data?.data;
}

export async function deleteBanner(id) {
  await client.delete(`${endpoints.admin.cms}/banners/${id}`);
}

export async function deleteFaqItem(id) {
  await client.delete(`${endpoints.admin.cms}/faq/${id}`);
}
