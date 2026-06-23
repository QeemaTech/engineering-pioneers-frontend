import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addToWishlist, fetchWishlist, removeFromWishlist } from "./api";

export function useWishlist(options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ["student", "wishlist"],
    queryFn: fetchWishlist,
    enabled,
    retry: false,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, isWishlisted }) => {
      if (isWishlisted) await removeFromWishlist(courseId);
      else await addToWishlist(courseId);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "wishlist"] });
    },
  });
}
