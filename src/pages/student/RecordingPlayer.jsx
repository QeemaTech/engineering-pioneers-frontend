import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import PageHeader from "../../components/dashboard/PageHeader";
import {
  useCreatePlaybackNote,
  useDeletePlaybackNote,
  useRecordingDetail,
} from "../../features/student/recordings/hooks";
import { getErrorMessage } from "../../api/error";

export default function RecordingPlayer() {
  const { t } = useTranslation();
  const { sourceType, id } = useParams();
  const { data: recording, isLoading, isError, error, refetch } = useRecordingDetail(sourceType, id);
  const createNote = useCreatePlaybackNote();
  const deleteNote = useDeletePlaybackNote();
  const [noteText, setNoteText] = useState("");
  const [noteErr, setNoteErr] = useState("");

  const handleAddNote = async () => {
    const content = noteText.trim();
    if (!content) return;
    setNoteErr("");
    try {
      await createNote.mutateAsync({
        sourceType,
        id,
        body: { content, timestampSeconds: 0 },
      });
      setNoteText("");
    } catch (e) {
      setNoteErr(getErrorMessage(e, t("student.recordings.noteError", { defaultValue: "Could not save note." })));
    }
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">{t("dashboard.common.loading")}</p>;
  }

  if (isError || !recording) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-red-600">{getErrorMessage(error, t("student.recordings.loadError", { defaultValue: "Recording not found." }))}</p>
        <button type="button" onClick={() => void refetch()} className="text-sm font-semibold text-pioneer-orange-normal hover:underline">
          {t("takeExam.retry")}
        </button>
        <div>
          <Link to="/student/recordings" className="text-sm text-pioneer-orange-normal hover:underline">
            ← {t("student.recordings.back", { defaultValue: "Back to library" })}
          </Link>
        </div>
      </div>
    );
  }

  const notes = recording.notes ?? [];

  return (
    <div className="space-y-6">
      <Link to="/student/recordings" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-pioneer-orange-normal">
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("student.recordings.back", { defaultValue: "Back to library" })}
      </Link>

      <PageHeader title={recording.title} subtitle={recording.subtitle || recording.courseTitle || ""} />

      <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 shadow-lg" style={{ paddingTop: "56.25%" }}>
        {recording.videoUrl ? (
          <iframe
            title={recording.title}
            src={recording.videoUrl}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            {t("courseView.videoPlaceholder")}
          </div>
        )}
      </div>

      {recording.canTakeNotes !== false ? (
        <section className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-700/40 dark:bg-[#1E293B]">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t("student.recordings.notesTitle", { defaultValue: "Playback notes" })}</h2>
          <p className="mt-1 text-sm text-slate-500">{recording.notesEmptyMessage || t("student.recordings.notesHint", { defaultValue: "Jot down key points while you watch." })}</p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={t("student.recordings.notePlaceholder", { defaultValue: "Add a note…" })}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-slate-600 dark:bg-[#0F172A] dark:text-white"
            />
            <button
              type="button"
              disabled={createNote.isPending || !noteText.trim()}
              onClick={() => void handleAddNote()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-pioneer-orange-normal px-4 py-2.5 text-sm font-bold text-white hover:bg-pioneer-orange-hover disabled:opacity-50"
            >
              {createNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {t("student.recordings.addNote", { defaultValue: "Add note" })}
            </button>
          </div>
          {noteErr ? <p className="mt-2 text-sm text-red-600">{noteErr}</p> : null}

          <ul className="mt-4 space-y-2">
            {notes.length === 0 ? (
              <li className="text-sm text-slate-500">{t("student.recordings.noNotes", { defaultValue: "No notes yet." })}</li>
            ) : (
              notes.map((note) => (
                <li key={note.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-[#0F172A]">
                  <p className="text-sm text-slate-700 dark:text-slate-200">{note.content}</p>
                  <button
                    type="button"
                    onClick={() => void deleteNote.mutateAsync({ sourceType, id, noteId: note.id })}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={t("student.recordings.deleteNote", { defaultValue: "Delete note" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      {recording.upNext?.length ? (
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">{t("student.recordings.upNext", { defaultValue: "Up next" })}</h2>
          <ul className="space-y-2">
            {recording.upNext
              .filter((item) => item.status !== "CURRENT")
              .slice(0, 5)
              .map((item) => (
                <li key={`${item.sourceType}-${item.id}`}>
                  <Link
                    to={`/student/recordings/${item.sourceType}/${item.id}`}
                    className="block rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-pioneer-orange-normal dark:border-slate-700 dark:text-slate-200"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
