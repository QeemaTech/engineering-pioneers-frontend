/** Deterministic pseudo-random helpers — stable across re-renders (no Math.random). */

export function seededRatio(seed, salt = 0) {
  const str = `${seed ?? ""}:${salt}`;
  let n = 0;
  for (let i = 0; i < str.length; i += 1) {
    n = (n + str.charCodeAt(i) * (i + 1)) % 9973;
  }
  return (n % 1000) / 1000;
}

export function seededInt(seed, min, max, salt = 0) {
  if (max <= min) return min;
  return Math.round(min + seededRatio(seed, salt) * (max - min));
}

export function buildOverviewRevenueSeries(timeFilter, revenueTrend, baseRevenue, isRtl) {
  const base = Math.max(Number(baseRevenue) || 0, 120000);
  const monthlyScale = base / 6;
  const locale = isRtl ? "ar-EG" : "en-US";

  if (timeFilter === "24h") {
    const now = new Date();
    return Array.from({ length: 12 }, (_, idx) => {
      const hour = (now.getHours() - 11 + idx + 24) % 24;
      const ampm = hour >= 12 ? (isRtl ? "م" : "PM") : isRtl ? "ص" : "AM";
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const label = isRtl ? `${hour12} ${ampm}` : `${hour12} ${ampm}`;
      const wave = 0.72 + Math.sin(idx * 0.85) * 0.18 + seededRatio(idx, 2) * 0.1;
      return {
        label,
        total: Math.round(monthlyScale * 0.045 * wave),
      };
    });
  }

  if (timeFilter === "7d") {
    const weights = [0.11, 0.13, 0.12, 0.15, 0.14, 0.17, 0.18];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString(locale, { weekday: "short" }),
        total: Math.round(monthlyScale * weights[i]),
      };
    });
  }

  if (timeFilter === "30d") {
    const weights = [0.22, 0.26, 0.24, 0.28];
    return weights.map((w, i) => ({
      label: isRtl ? `أسبوع ${i + 1}` : `W${i + 1}`,
      total: Math.round(monthlyScale * w),
    }));
  }

  const apiData = (revenueTrend ?? []).map((r) => ({
    label: r.label,
    total: Number(r.total) || 0,
  }));
  const apiSum = apiData.reduce((sum, row) => sum + row.total, 0);
  if (apiData.length > 0 && apiSum > 0) return apiData;

  const weights = [0.12, 0.14, 0.15, 0.17, 0.19, 0.23];
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      label: d.toLocaleDateString(locale, { month: "short" }),
      total: Math.round(monthlyScale * weights[i]),
    };
  });
}

export function buildFallbackTopCourses(topCourses, totalStudents, isRtl) {
  const fromApi = (topCourses ?? []).map((c) => ({
    name: c.title.length > 24 ? `${c.title.slice(0, 22)}…` : c.title,
    fullTitle: c.title,
    enrollments: c.enrollmentCount,
  }));

  if (fromApi.length >= 3) return fromApi.slice(0, 5);

  const titles = isRtl
    ? ["برمجة ويب", "علم البيانات", "أمن سيبراني", "تصميم واجهات", "شبكات"]
    : ["Web Development", "Data Science", "Cybersecurity", "UI/UX Design", "Networking"];
  const weights = [0.28, 0.22, 0.18, 0.17, 0.15];
  const studentBase = Math.max(Number(totalStudents) || 0, 48);

  const merged = [...fromApi];
  for (let i = merged.length; i < 5; i += 1) {
    const title = titles[i];
    merged.push({
      name: title.length > 24 ? `${title.slice(0, 22)}…` : title,
      fullTitle: title,
      enrollments: Math.max(8, Math.round(studentBase * weights[i])),
    });
  }
  return merged.slice(0, 5);
}

export function buildFallbackRecentActivity(isRtl) {
  const now = Date.now();
  return [
    {
      id: "fallback-enroll-1",
      type: "enrollment",
      at: new Date(now - 12 * 60 * 1000).toISOString(),
      studentName: isRtl ? "أحمد محمود" : "Ahmed Mahmoud",
      label: isRtl ? "برمجة ويب متقدمة" : "Advanced Web Development",
    },
    {
      id: "fallback-pay-1",
      type: "payment",
      at: new Date(now - 45 * 60 * 1000).toISOString(),
      studentName: isRtl ? "سارة علي" : "Sarah Ali",
      label: isRtl ? "علم البيانات" : "Data Science",
      amount: 249,
    },
    {
      id: "fallback-enroll-2",
      type: "enrollment",
      at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      studentName: isRtl ? "محمد حسن" : "Mohamed Hassan",
      label: isRtl ? "أمن سيبراني" : "Cybersecurity Fundamentals",
    },
  ];
}
