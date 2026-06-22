export const QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY"];

export function normalizeOptions(raw, type) {
  if (type === "TRUE_FALSE") return ["True", "False"];
  if (raw == null) return ["", "", "", ""];
  if (typeof raw === "string") {
    try {
      return normalizeOptions(JSON.parse(raw), type);
    } catch {
      return ["", "", "", ""];
    }
  }
  if (Array.isArray(raw)) {
    if (!raw.length) return ["", "", "", ""];
    if (typeof raw[0] === "string") return raw.map(String);
    return raw.map((o) => (o?.text != null ? String(o.text) : o?.label != null ? String(o.label) : String(o?.id ?? "")));
  }
  return ["", "", "", ""];
}

export function defaultOptionsForType(type) {
  if (type === "TRUE_FALSE") return ["True", "False"];
  if (type === "MULTIPLE_CHOICE") return ["", "", "", ""];
  return [];
}

export function defaultCorrectForType(type, options) {
  if (type === "TRUE_FALSE") return "True";
  if (type === "MULTIPLE_CHOICE") return options[0] || "";
  return "";
}

export function buildQuestionPayload({ questionText, type, points, order, options, correctAnswer }) {
  const trimmedText = questionText.trim();
  const pts = Number(points);

  if (type === "MULTIPLE_CHOICE") {
    const cleaned = options.map((o) => o.trim()).filter(Boolean);
    if (cleaned.length < 2) throw new Error("MIN_OPTIONS");
    if (!correctAnswer || !cleaned.includes(correctAnswer)) throw new Error("CORRECT_REQUIRED");
    return {
      questionText: trimmedText,
      type,
      points: pts,
      order,
      options: cleaned,
      correctAnswer,
    };
  }

  if (type === "TRUE_FALSE") {
    const answer = correctAnswer === "False" ? "False" : "True";
    return {
      questionText: trimmedText,
      type,
      points: pts,
      order,
      options: ["True", "False"],
      correctAnswer: answer,
    };
  }

  return {
    questionText: trimmedText,
    type,
    points: pts,
    order,
    options: undefined,
    correctAnswer: correctAnswer?.trim() || undefined,
  };
}
