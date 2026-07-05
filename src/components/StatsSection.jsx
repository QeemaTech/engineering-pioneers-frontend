import { useTranslation } from "react-i18next";
import { Users, GraduationCap, Video, Award } from "lucide-react";

function StatsSection({ stats }) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // Use dynamic numbers from stats or fallbacks matching current platform data
  const studentsCount = stats?.studentsFormatted || "1490+";
  const coursesCount = stats?.courses ? `${stats.courses}+` : "15+";
  const instructorsCount = stats?.instructors ? `${stats.instructors}+` : "8+";

  const metrics = [
    {
      id: "students",
      value: studentsCount,
      labelAr: "طالب نشط مسجل",
      labelEn: "Active Registered Students",
      icon: Users,
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-500/10",
      textColor: "text-orange-500",
    },
    {
      id: "courses",
      value: coursesCount,
      labelAr: "مساقات أكاديمية متخصصة",
      labelEn: "Specialized Academic Courses",
      icon: GraduationCap,
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-500/10",
      textColor: "text-blue-500",
    },
    {
      id: "instructors",
      value: instructorsCount,
      labelAr: "محاضرين خبراء ومعتمدين",
      labelEn: "Certified Expert Lecturers",
      icon: Video,
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-500/10",
      textColor: "text-emerald-500",
    },
    {
      id: "success",
      value: "100%",
      labelAr: "نسبة رضا الطلاب والاجتياز",
      labelEn: "Student Satisfaction & Passing Rate",
      icon: Award,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10",
      textColor: "text-purple-500",
    },
  ];

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group relative flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg} ${item.textColor} mb-4 transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-850 dark:text-white tracking-tight mb-1">
                  {item.value}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-450 dark:text-slate-400">
                  {isRtl ? item.labelAr : item.labelEn}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
