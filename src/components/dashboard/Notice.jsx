import { AlertCircle, CheckCircle2 } from "lucide-react";

function Notice({ type = "error", message }) {
  if (!message) return null;

  const isSuccess = type === "success";
  
  return (
    <div className={`mb-8 flex items-center gap-4 rounded-xl border p-5 text-sm font-semibold shadow-sm transition-all ${
      isSuccess 
        ? "border-green-200 bg-white text-green-600 shadow-green-100/50" 
        : "border-pioneer-orange-normal/20 bg-white text-pioneer-orange-normal shadow-orange-100/50"
    }`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        isSuccess ? "bg-green-50" : "bg-[#EE7C11]/10"
      }`}>
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
      </div>
      <p className="flex-1">{message}</p>
    </div>
  );
}

export default Notice;


