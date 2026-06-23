import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlaybackNote,
  deletePlaybackNote,
  fetchRecordingDetail,
  fetchStudentRecordings,
  updatePlaybackNote,
} from "./api";

export function useStudentRecordings() {
  return useQuery({
    queryKey: ["student", "recordings"],
    queryFn: fetchStudentRecordings,
    retry: false,
  });
}

export function useRecordingDetail(sourceType, id) {
  return useQuery({
    queryKey: ["student", "recording", sourceType, id],
    queryFn: () => fetchRecordingDetail(sourceType, id),
    enabled: Boolean(sourceType && id),
    retry: false,
  });
}

export function useCreatePlaybackNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceType, id, body }) => createPlaybackNote(sourceType, id, body),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "recording", v.sourceType, v.id] });
    },
  });
}

export function useUpdatePlaybackNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceType, id, noteId, body }) => updatePlaybackNote(sourceType, id, noteId, body),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "recording", v.sourceType, v.id] });
    },
  });
}

export function useDeletePlaybackNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceType, id, noteId }) => deletePlaybackNote(sourceType, id, noteId),
    onSuccess: (_, v) => {
      void qc.invalidateQueries({ queryKey: ["student", "recording", v.sourceType, v.id] });
    },
  });
}
