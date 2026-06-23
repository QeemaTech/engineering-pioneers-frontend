import client from "../../../api/client";
import endpoints from "../../../api/endpoints";

export async function fetchStudentRecordings() {
  const res = await client.get(endpoints.student.recordings);
  const data = res?.data?.data;
  if (data?.recordings) return data;
  if (Array.isArray(data)) return { recordings: data, counts: { total: data.length } };
  return { recordings: [], counts: { total: 0, liveSessions: 0, recordedLessons: 0 } };
}

export async function fetchRecordingDetail(sourceType, id) {
  const res = await client.get(endpoints.student.recordingDetail(sourceType, id));
  return res?.data?.data ?? null;
}

export async function createPlaybackNote(sourceType, id, body) {
  const res = await client.post(endpoints.student.recordingNotes(sourceType, id), body);
  return res?.data?.data ?? null;
}

export async function updatePlaybackNote(sourceType, id, noteId, body) {
  const res = await client.patch(endpoints.student.recordingNote(sourceType, id, noteId), body);
  return res?.data?.data ?? null;
}

export async function deletePlaybackNote(sourceType, id, noteId) {
  const res = await client.delete(endpoints.student.recordingNote(sourceType, id, noteId));
  return res?.data?.data ?? null;
}
