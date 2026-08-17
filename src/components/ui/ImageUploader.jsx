import { useCallback, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { IMAGE_MAX_BYTES, getUploadErrorMessage, uploadImageFile, validateImageFile } from "../../features/media/api";
import { resolveMediaUrl } from "../../utils/mediaUrl";

export default function ImageUploader({
  value = "",
  onChange,
  required = false,
  allowRemove = true,
  allowExternalUrl = true,
  disabled = false,
  variant = "default",
  label,
  helperText,
  className = "",
}) {
  const { t } = useTranslation();
  const inputId = useId();
  const fileRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  const preview = resolveMediaUrl(value);
  const isAvatar = variant === "avatar";
  const isCompact = variant === "compact";

  const tx = (key, fallback, extra) => t(`imageUploader.${key}`, { defaultValue: fallback, ...extra });

  const emit = (next) => {
    onChange?.(next);
  };

  const handleFile = useCallback(
    async (file) => {
      if (!file || disabled) return;
      const localError = validateImageFile(file);
      if (localError) {
        setError(file.size > IMAGE_MAX_BYTES ? tx("tooLarge", localError) : tx("invalidType", localError));
        return;
      }

      setError("");
      setUploading(true);
      setProgress(0);
      try {
        const imageUrl = await uploadImageFile(file, { onProgress: setProgress });
        emit(imageUrl);
        setUrlDraft("");
      } catch (err) {
        setError(getUploadErrorMessage(err, tx("failed", "Image upload failed.")));
      } finally {
        setUploading(false);
        setProgress(0);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [disabled, onChange, t]
  );

  const onInputChange = (e) => {
    const file = e.target.files?.[0];
    void handleFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    void handleFile(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const applyExternalUrl = () => {
    const next = urlDraft.trim();
    if (!next) return;
    try {
      const parsed = new URL(next);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("bad");
      }
    } catch {
      setError(tx("badUrl", "Enter a valid image URL."));
      return;
    }
    setError("");
    emit(next);
    setUrlDraft("");
  };

  const removeImage = () => {
    setError("");
    emit("");
  };

  const dropHeight = isAvatar ? "h-28 w-28" : isCompact ? "h-28" : "h-44";
  const dropRadius = isAvatar ? "rounded-2xl" : "rounded-xl";

  return (
    <div className={`space-y-2 ${className}`}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required ? <span className="text-red-500"> *</span> : null}
        </label>
      ) : null}

      <input
        id={inputId}
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        disabled={disabled || uploading}
        onChange={onInputChange}
      />

      {preview ? (
        <div className={`relative overflow-hidden border border-slate-200 dark:border-white/10 ${dropRadius} ${isAvatar ? "h-28 w-28" : ""}`}>
          <img
            src={preview}
            alt=""
            className={`${isAvatar ? "h-full w-full" : `${dropHeight} w-full`} object-cover`}
          />
          {uploading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/55 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-semibold">{progress}%</span>
            </div>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-1.5 bg-gradient-to-t from-slate-900/70 p-2">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-bold text-slate-800 hover:bg-white disabled:opacity-50"
            >
              {tx("replace", "Replace")}
            </button>
            {allowRemove && !required ? (
              <button
                type="button"
                disabled={disabled || uploading}
                onClick={removeImage}
                className="inline-flex items-center gap-1 rounded-lg bg-red-500/95 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                {tx("remove", "Remove")}
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragEnter={onDragOver}
          onDragLeave={onDragLeave}
          className={`flex ${dropHeight} ${isAvatar ? "w-28" : "w-full"} ${dropRadius} flex-col items-center justify-center gap-1.5 border-2 border-dashed px-4 text-center transition ${
            dragActive
              ? "border-[#EE7C11] bg-[#EE7C11]/10"
              : "border-slate-300 bg-slate-50 hover:border-[#EE7C11] hover:bg-slate-100 dark:border-white/15 dark:bg-[#0F0F13] dark:hover:bg-white/[0.04]"
          } disabled:opacity-60`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin text-[#EE7C11]" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {tx("uploading", "Uploading...")} {progress ? `${progress}%` : ""}
              </span>
            </>
          ) : (
            <>
              {dragActive ? (
                <Upload className="h-7 w-7 text-[#EE7C11]" />
              ) : (
                <ImagePlus className="h-7 w-7 text-slate-400" />
              )}
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {tx("drop", "Drag & drop an image here")}
              </span>
              <span className="text-[11px] text-slate-500">{tx("browse", "or click to browse")}</span>
              <span className="text-[10px] text-slate-400">{tx("hint", "JPEG, PNG, WEBP · max 5MB")}</span>
            </>
          )}
        </button>
      )}

      {helperText ? <p className="text-[11px] text-slate-500">{helperText}</p> : null}
      {error ? <p className="text-xs text-red-600 dark:text-red-400">{error}</p> : null}

      {allowExternalUrl ? (
        <div className="flex flex-wrap gap-2">
          <input
            type="url"
            value={urlDraft}
            disabled={disabled || uploading}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder={tx("urlPlaceholder", "or paste https://...")}
            className="h-10 min-w-[180px] flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#EE7C11] dark:border-white/10 dark:bg-[#0F0F13] dark:text-white"
          />
          <button
            type="button"
            disabled={disabled || uploading || !urlDraft.trim()}
            onClick={applyExternalUrl}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/5"
          >
            <Link2 className="h-3.5 w-3.5" />
            {tx("useUrl", "Use URL")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
