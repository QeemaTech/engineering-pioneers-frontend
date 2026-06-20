import client from "../../../api/client";
import endpoints from "../../../api/endpoints";
import type { AdminPackage, CreatePackageInput, UpdatePackageInput } from "./types";

function normalizePackage(raw: any): AdminPackage {
  const durationMonths = Number(raw?.durationMonths ?? 1);
  return {
    id: String(raw?.id || ""),
    name: String(raw?.name || ""),
    description: raw?.description ?? null,
    durationMonths: Number(raw?.durationMonths ?? 1),
    price: Number(raw?.price ?? 0),
    isActive: raw?.isActive !== false,
    isRecommended: raw?.isRecommended === true,
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

function toBackendPayload(body: any) {
  return {
    name: body.name,
    description: body.description ?? "",
    price: Number(body.price),
    durationMonths: Number(body.durationMonths),
    isActive: body.isActive !== false,
    isRecommended: body.isRecommended === true,
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
