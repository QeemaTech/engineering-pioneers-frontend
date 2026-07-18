import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import type { AdminPackage, CreatePackageInput, UpdatePackageInput } from "./types";

function normalizePackage(raw: any): AdminPackage {
  return {
    id: String(raw?.id || ""),
    title: String(raw?.title || ""),
    titleAr: raw?.titleAr ?? null,
    description: raw?.description ?? null,
    descriptionAr: raw?.descriptionAr ?? null,
    price: Number(raw?.price ?? 0),
    image: raw?.image ?? null,
    isActive: raw?.isActive !== false,
    isRecommended: raw?.isRecommended === true,
    courses: raw?.courses || [],
    pricingTiers: raw?.pricingTiers || [],
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

function toBackendPayload(body: any) {
  return {
    title: body.title,
    titleAr: body.titleAr ?? "",
    description: body.description ?? "",
    descriptionAr: body.descriptionAr ?? "",
    price: Number(body.price),
    image: body.image ?? null,
    isActive: body.isActive !== false,
    courseIds: body.courseIds || [],
    pricingTiers: body.pricingTiers || [],
  };
}

export async function fetchAdminPackages(): Promise<AdminPackage[]> {
  const response = await client.get(`${endpoints.admin.financials}/packages`);
  const payload = response?.data?.data;
  return Array.isArray(payload) ? payload.map(normalizePackage) : [];
}

export async function fetchAdminPackage(id: string): Promise<AdminPackage | null> {
  const response = await client.get(`${endpoints.admin.financials}/packages/${id}`);
  const payload = response?.data?.data;
  return payload ? normalizePackage(payload) : null;
}

export async function createAdminPackage(body: CreatePackageInput): Promise<AdminPackage | null> {
  const response = await client.post(`${endpoints.admin.financials}/packages`, toBackendPayload(body));
  const payload = response?.data?.data;
  return payload ? normalizePackage(payload) : null;
}

export async function updateAdminPackage(args: {
  id: string;
  body: UpdatePackageInput;
}): Promise<AdminPackage | null> {
  const response = await client.patch(`${endpoints.admin.financials}/packages/${args.id}`, toBackendPayload(args.body));
  const payload = response?.data?.data;
  return payload ? normalizePackage(payload) : null;
}

export async function deleteAdminPackage(id: string): Promise<{ id: string; deleted: boolean } | null> {
  const response = await client.delete(`${endpoints.admin.financials}/packages/${id}`);
  return (response?.data?.data as { id: string; deleted: boolean }) ?? null;
}
