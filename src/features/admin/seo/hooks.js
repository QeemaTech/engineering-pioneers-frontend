import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchAdminSeoSettings,
  updateAdminSeoSettings,
  fetchAdminSeoAudit,
  fetchAdminSitemapPreview,
  fetchPublicSeoSettings,
} from "./api";

export const SEO_KEYS = {
  admin: ["admin", "seo", "settings"],
  audit: ["admin", "seo", "audit"],
  sitemapPreview: ["admin", "seo", "sitemap-preview"],
  public: ["public", "seo", "settings"],
};

export function useAdminSeoSettings() {
  return useQuery({
    queryKey: SEO_KEYS.admin,
    queryFn: fetchAdminSeoSettings,
    staleTime: 60 * 1000,
  });
}

export function useUpdateAdminSeoSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAdminSeoSettings,
    onSuccess: () => {
      toast.success("تم حفظ إعدادات الـ SEO بنجاح");
      qc.invalidateQueries({ queryKey: SEO_KEYS.admin });
      qc.invalidateQueries({ queryKey: SEO_KEYS.public });
      qc.invalidateQueries({ queryKey: SEO_KEYS.audit });
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || err?.message || "فشل حفظ إعدادات الـ SEO";
      toast.error(msg);
    },
  });
}

export function useAdminSeoAudit() {
  return useQuery({
    queryKey: SEO_KEYS.audit,
    queryFn: fetchAdminSeoAudit,
    staleTime: 30 * 1000,
  });
}

export function useAdminSitemapPreview() {
  return useQuery({
    queryKey: SEO_KEYS.sitemapPreview,
    queryFn: fetchAdminSitemapPreview,
    staleTime: 60 * 1000,
  });
}

export function usePublicSeoSettings() {
  return useQuery({
    queryKey: SEO_KEYS.public,
    queryFn: fetchPublicSeoSettings,
    staleTime: 5 * 60 * 1000, // 5 mins cache
  });
}
