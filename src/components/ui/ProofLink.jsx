import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import client from "../api/client";

function isExternalHttp(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim()) && !/\/uploads\/(receipts|payouts)\//i.test(url);
}

export default function ProofLink({
  proofPath,
  storedUrl,
  label = "View proof",
  className = "inline-flex items-center gap-1 text-xs font-bold text-pioneer-orange-normal hover:underline",
}) {
  const [loading, setLoading] = useState(false);

  const openProof = async () => {
    if (isExternalHttp(storedUrl)) {
      window.open(storedUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!proofPath) return;
    setLoading(true);
    try {
      const res = await client.get(proofPath, { responseType: "blob" });
      const blobUrl = URL.createObjectURL(res.data);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } finally {
      setLoading(false);
    }
  };

  if (!storedUrl && !proofPath) return <span className="text-slate-400">—</span>;
  if (storedUrl === "INSTANT_FREE_ENROLLMENT") return <span className="text-slate-400">—</span>;

  return (
    <button type="button" onClick={() => void openProof()} disabled={loading} className={className}>
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
