import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createAvailabilitySlot, deleteAvailabilitySlot, fetchInstructorAvailability, updateAvailabilitySlotPrice } from "./api";

export function useInstructorAvailability() {
  return useQuery({
    queryKey: ["instructor", "availability"],
    queryFn: fetchInstructorAvailability,
  });
}

export function useCreateAvailabilitySlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAvailabilitySlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "availability"] });
    },
  });
}

export function useDeleteAvailabilitySlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAvailabilitySlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "availability"] });
    },
  });
}

export function useUpdateAvailabilitySlotPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slotId, price }) => updateAvailabilitySlotPrice(slotId, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "availability"] });
      queryClient.invalidateQueries({ queryKey: ["public", "instructor"] });
      queryClient.invalidateQueries({ queryKey: ["student", "booking-slots"] });
    },
  });
}
