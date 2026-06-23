import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWalletPayouts, fetchWalletSummary, fetchWalletTransactions, requestPayout } from "./api";

export function useWalletSummary() {
  return useQuery({
    queryKey: ["instructor", "wallet", "summary"],
    queryFn: fetchWalletSummary,
  });
}

export function useWalletTransactions(params) {
  return useQuery({
    queryKey: ["instructor", "wallet", "transactions", params],
    queryFn: () => fetchWalletTransactions(params),
  });
}

export function useWalletPayouts() {
  return useQuery({
    queryKey: ["instructor", "wallet", "payouts"],
    queryFn: fetchWalletPayouts,
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "wallet"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "finance", "payouts"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "instructors"] });
    },
  });
}
