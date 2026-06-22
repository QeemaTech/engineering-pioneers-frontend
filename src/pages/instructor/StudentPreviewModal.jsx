import { useState, useEffect } from "react";
import { X, Play, FileText, FileCode, Award, HelpCircle } from "lucide-react";

function StudentPreviewModal({ course, curriculumData, onClose, dir }) {
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeExam, setActiveExam] = useState(null);

  // Auto-select first lesson for premium player demo preview
  useEffect(() => {
    if (curriculumData.units?.[0]?.sections?.[0]?.lessons?.[0]) {
      setActiveLesson(curriculumData.units[0].sections[0].lessons[0]);
    }
  }, [curriculumData]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm antialiased font-sans">
      <div className="w-full max-w-4xl h-[85vh] rounded-3xl bg-slate-900 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Top Control Player Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-[#EE7C11] uppercase tracking-wider">
              {dir === "rtl" ? "معاينة واجهة الطالب" : "Student View Portal"}
            </span>
            <h3 className="text-sm font-bold text-white mt-0.5">{course.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-slate-350 hover:bg-slate-800 text-white"
          >
            <X className="h-4 w-4" /> Close Preview
          </button>
        </div>

        {/* Content Portal */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Video Screen & Resources */}
          <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto bg-slate-900 animate-in fade-in duration-200">
            {/* Exam Preview or Live Session or Pre-recorded Video */}
            {activeExam ? (
              <div className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-6 space-y-6 max-w-2xl mx-auto my-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 font-cairo">
                  <div>
                    <span className="bg-[#EE7C11]/15 text-[#EE7C11] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {dir === "rtl" ? "اختبار تقييمي" : "Course Assessment"}
                    </span>
                    <h4 className="font-bold text-white text-base mt-3">
                      {activeExam.title}
                    </h4>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                    {dir === "rtl" ? "متاح للتقديم" : "Available"}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-cairo">
                  {activeExam.description || (dir === "rtl" ? "لا يوجد وصف متوفر لهذا الاختبار." : "No description provided for this assessment.")}
                </p>

                {/* Exam Parameters Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white/1 p-4 rounded-2xl border border-slate-800/40 text-center">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-cairo">{dir === "rtl" ? "المدة" : "Duration"}</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{activeExam.durationMinutes} {dir === "rtl" ? "دقيقة" : "mins"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-cairo">{dir === "rtl" ? "الأسئلة" : "Questions"}</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{activeExam.questions?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-cairo">{dir === "rtl" ? "الدرجة الكلية" : "Total Points"}</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{activeExam.totalPoints || 100} {dir === "rtl" ? "درجة" : "pts"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-cairo">{dir === "rtl" ? "نسبة النجاح" : "الحد الأدنى"}</p>
                    <p className="text-xs font-bold text-slate-200 mt-1">{activeExam.passingScore || 60} {dir === "rtl" ? "درجة" : "pts"}</p>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-2 font-cairo">
                  <h5 className="text-xs font-bold text-slate-350 flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-[#EE7C11]" />
                    {dir === "rtl" ? "تعليمات هامة للاختبار:" : "Important Instructions:"}
                  </h5>
                  <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-1">
                    <li>{dir === "rtl" ? `عدد المحاولات المتاحة للتقديم: ${activeExam.attempts || 2}` : `Attempts allowed: ${activeExam.attempts || 2}`}</li>
                    <li>{dir === "rtl" ? "بمجرد بدء الاختبار، سيبدأ العداد التنازلي ولا يمكن إيقافه مؤقتاً." : "Once started, the countdown timer cannot be paused."}</li>
                    <li>{dir === "rtl" ? "يرجى التأكد من اتصال الإنترنت المستقر قبل البدء." : "Ensure a stable internet connection before launching."}</li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#EE7C11]/50 text-white py-3 text-xs font-bold cursor-not-allowed opacity-80 font-cairo"
                >
                  <span>{dir === "rtl" ? "بدء تقديم الاختبار (معاينة)" : "Start Assessment (Preview Mode)"}</span>
                </button>
              </div>
            ) : activeLesson?.isLive ? (
              <div className="aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 relative flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="h-14 w-14 rounded-full bg-[#EE7C11]/10 flex items-center justify-center text-[#EE7C11] animate-pulse">
                  <Play className="h-6 w-6 fill-current rotate-0" />
                </div>
                <div>
                  <span className="bg-[#EE7C11]/15 text-[#EE7C11] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-cairo">
                    {dir === "rtl" ? "بث مباشر لايف" : "Live Session"}
                  </span>
                  <h4 className="font-bold text-white text-base mt-3">
                    {activeLesson.title}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-semibold bg-white/1 p-4 rounded-xl border border-slate-800/40 max-w-md w-full">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{dir === "rtl" ? "الموعد" : "Start Time"}</p>
                    <p className="text-slate-200 mt-0.5">
                      {activeLesson.availableAt ? new Date(activeLesson.availableAt).toLocaleString() : (dir === "rtl" ? "غير محدد" : "Not Scheduled")}
                    </p>
                  </div>
                  <div className="h-6 w-px bg-slate-800" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{dir === "rtl" ? "المدة" : "Duration"}</p>
                    <p className="text-slate-200 mt-0.5">
                      {activeLesson.durationSeconds ? `${Math.round(activeLesson.durationSeconds / 60)} mins` : "30 mins"}
                    </p>
                  </div>
                </div>

                {activeLesson.meetingUrl ? (
                  <a
                    href={activeLesson.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-xl bg-[#EE7C11] hover:bg-[#d9700e] text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-[#EE7C11]/15 transition-all"
                  >
                    {dir === "rtl" ? "الانضمام إلى البث المباشر (Zoom / Meet)" : "Join Live Meeting"}
                  </a>
                ) : (
                  <p className="text-xs text-rose-450 font-semibold italic bg-rose-500/5 px-4 py-2 rounded-xl border border-rose-500/10">
                    {dir === "rtl" ? "رابط الاجتماع المباشر غير متوفر حالياً. سيقوم المحاضر بإضافته قريباً." : "Meeting link is not ready yet. Please wait for the instructor."}
                  </p>
                )}
              </div>
            ) : (
              /* Pre-recorded Video Container */
              <div className="aspect-video w-full rounded-2xl bg-black border border-slate-800 relative flex flex-col items-center justify-center text-center p-4">
                <Play className="h-12 w-12 text-[#EE7C11] mb-3 fill-[#EE7C11]" />
                <h4 className="font-bold text-white text-sm">
                  {activeLesson ? activeLesson.title : "Select a lesson to preview player..."}
                </h4>
                <p className="text-[11px] text-slate-550 mt-1">
                  {activeLesson?.videoUrl ? `Video URL: ${activeLesson.videoUrl}` : "No video source attached"}
                </p>
              </div>
            )}

            {/* Attached Blueprint Worksheet */}
            {activeLesson && (
              <div className="rounded-2xl border border-slate-800 bg-slate-955/60 p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  {dir === "rtl" ? "المرفقات الفنية للدرس" : "Lesson Attachments & CAD sheets"}
                </h4>
                
                {!curriculumData.homeworks || curriculumData.homeworks.filter(h => {
                  // Link check: h.lessons?.[0]?.lessonId === activeLesson.id OR h.lessonId === activeLesson.id
                  const associatedLessonId = h.lessonId || h.lessons?.[0]?.lessonId || h.lessons?.[0]?.lesson?.id;
                  return associatedLessonId === activeLesson.id;
                }).length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    No blueprints or worksheets linked to this lesson.
                  </p>
                ) : (
                  curriculumData.homeworks.filter(h => {
                    const associatedLessonId = h.lessonId || h.lessons?.[0]?.lessonId || h.lessons?.[0]?.lesson?.id;
                    return associatedLessonId === activeLesson.id;
                  }).map(hw => (
                    <div key={hw.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex items-center gap-3">
                        <FileCode className="h-5 w-5 text-[#EE7C11]" />
                        <div>
                          <h5 className="text-xs font-bold text-slate-200">{hw.title}</h5>
                          <p className="text-[10px] text-slate-500 mt-0.5">{hw.attachments?.[0] || hw.filename}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#EE7C11] border border-[#EE7C11]/30 rounded-full px-2 py-0.5">
                        {hw.totalPoints || hw.points} pts
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Curriculum Sidebar */}
          <div className="w-80 border-s border-slate-800 bg-slate-950 overflow-y-auto p-4 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {dir === "rtl" ? "منهج الكورس" : "Course Outline"}
            </h4>

            {!curriculumData.units || curriculumData.units.length === 0 ? (
              <p className="text-xs text-slate-600">No lessons built.</p>
            ) : (
              curriculumData.units.map(unit => (
                <div key={unit.id} className="space-y-2">
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate font-cairo">
                    {unit.title}
                  </h5>
                  {unit.sections?.map(sec => (
                    <div key={sec.id} className="ps-2 space-y-1">
                      {sec.lessons?.map(les => {
                        const lessonExams = curriculumData.exams?.filter(ex => ex.lessonId === les.id) || [];
                        return (
                          <div key={les.id} className="space-y-1">
                            <button
                              onClick={() => {
                                setActiveLesson(les);
                                setActiveExam(null);
                              }}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs transition-colors ${
                                activeLesson?.id === les.id
                                  ? "bg-[#EE7C11] text-white font-bold"
                                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                              }`}
                            >
                              {les.isLive ? (
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Live Session" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 shrink-0" />
                              )}
                              <span className="truncate">{les.title}</span>
                              {les.isLive && (
                                <span className={`text-[8px] uppercase font-extrabold px-1 py-0.5 rounded ml-auto ${
                                  activeLesson?.id === les.id ? "text-white bg-white/20" : "text-rose-500 bg-rose-500/10"
                                }`}>Live</span>
                              )}
                            </button>

                            {/* Lesson contextual exams */}
                            {lessonExams.map(exam => (
                              <button
                                key={exam.id}
                                onClick={() => {
                                  setActiveExam(exam);
                                  setActiveLesson(null);
                                }}
                                className={`w-full flex items-center gap-2 ps-6 pe-3 py-1.5 rounded-lg text-start text-[11px] transition-colors font-cairo ${
                                  activeExam?.id === exam.id
                                    ? "bg-amber-600/20 text-[#EE7C11] font-bold border border-amber-600/30"
                                    : "text-amber-500 hover:bg-slate-900 hover:text-amber-400"
                                }`}
                              >
                                <Award className="h-3 w-3 shrink-0 text-amber-500" />
                                <span className="truncate">{exam.title}</span>
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* Unit contextual exams */}
                  {curriculumData.exams?.filter(ex => ex.unitId === unit.id && !ex.lessonId).map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setActiveExam(exam);
                        setActiveLesson(null);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs transition-colors font-cairo ${
                        activeExam?.id === exam.id
                          ? "bg-amber-650/20 text-[#EE7C11] font-bold border border-amber-650/30"
                          : "text-amber-500 hover:bg-slate-900 hover:text-amber-400"
                      }`}
                    >
                      <Award className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                      <span className="truncate">{exam.title}</span>
                    </button>
                  ))}
                </div>
              ))
            )}

            {/* Course Exams Section */}
            {curriculumData.exams && curriculumData.exams.filter(ex => !ex.unitId && !ex.lessonId).length > 0 && (
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-cairo">
                  {dir === "rtl" ? "الاختبارات والتقييمات" : "Course Assessments"}
                </h5>
                <div className="space-y-1">
                  {curriculumData.exams.filter(ex => !ex.unitId && !ex.lessonId).map(exam => (
                    <button
                      key={exam.id}
                      onClick={() => {
                        setActiveExam(exam);
                        setActiveLesson(null);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-start text-xs transition-colors font-cairo ${
                        activeExam?.id === exam.id
                          ? "bg-[#EE7C11] text-white font-bold"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      <Award className="h-3.5 w-3.5 shrink-0 text-[#EE7C11]" />
                      <span className="truncate">{exam.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentPreviewModal;
