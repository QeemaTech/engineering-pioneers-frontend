import { useQuery } from "@tanstack/react-query";
import { fetchMyPayments } from "./api";

export function useMyPayments() {
  return useQuery({
    queryKey: ["student", "payments"],
    queryFn: fetchMyPayments,
    retry: false,
  });
}
