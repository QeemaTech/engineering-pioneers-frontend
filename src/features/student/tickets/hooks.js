import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTicket, fetchMyTickets, replyToTicket } from "./api";

export function useMyTickets() {
  return useQuery({
    queryKey: ["student", "tickets"],
    queryFn: fetchMyTickets,
    retry: false,
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "tickets"] });
    },
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, message }) => replyToTicket(ticketId, message),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["student", "tickets"] });
    },
  });
}
