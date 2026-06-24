import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { claimCourseCertificate, downloadStudentCertificate, fetchMyCertificates } from "./api";

export function useMyCertificates() {
  return useQuery({
    queryKey: ["student", "certificates"],
    queryFn: fetchMyCertificates,
    retry: false,
  });
}

export function useClaimCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: claimCourseCertificate,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "certificates"] });
    },
  });
}

export function useDownloadStudentCertificate() {
  return useMutation({
    mutationFn: downloadStudentCertificate,
  });
}
