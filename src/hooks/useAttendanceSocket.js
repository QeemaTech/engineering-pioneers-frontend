import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAttendanceSocket } from "../lib/socket";

/**
 * Subscribe to live attendance updates.
 */
export function useAttendanceSocket({ sessionId, watchStudentId, enabled = true } = {}) {
  const queryClient = useQueryClient();
  const sessionRef = useRef(sessionId);
  const watchRef = useRef(watchStudentId);

  sessionRef.current = sessionId;
  watchRef.current = watchStudentId;

  useEffect(() => {
    if (!enabled) return undefined;

    const sock = getAttendanceSocket();
    if (!sock) return undefined;

    const onStudentUpdate = (payload) => {
      void queryClient.invalidateQueries({ queryKey: ["student", "attendance"] });
      if (payload?.studentId) {
        void queryClient.invalidateQueries({ queryKey: ["admin", "student", payload.studentId, "attendance"] });
      }
    };

    const onSessionDetail = ({ sessionId: sid, detail }) => {
      if (sid && detail) {
        queryClient.setQueryData(["instructor", "attendance", "session", sid], detail);
      }
      void queryClient.invalidateQueries({ queryKey: ["instructor", "attendance", "sessions"] });
    };

    const onSessionRow = () => {
      const sid = sessionRef.current;
      if (sid) {
        void queryClient.invalidateQueries({ queryKey: ["instructor", "attendance", "session", sid] });
      }
    };

    sock.on("attendance:updated", onStudentUpdate);
    sock.on("attendance:session:detail", onSessionDetail);
    sock.on("attendance:session:updated", onSessionRow);

    if (sessionId) sock.emit("attendance:join-session", sessionId);
    if (watchStudentId) sock.emit("attendance:watch-student", watchStudentId);

    return () => {
      sock.off("attendance:updated", onStudentUpdate);
      sock.off("attendance:session:detail", onSessionDetail);
      sock.off("attendance:session:updated", onSessionRow);
      if (sessionId) sock.emit("attendance:leave-session", sessionId);
      if (watchStudentId) sock.emit("attendance:unwatch-student", watchStudentId);
    };
  }, [enabled, sessionId, watchStudentId, queryClient]);
}
