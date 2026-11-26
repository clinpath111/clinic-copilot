"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/client";
import type { MessageKey } from "@/lib/i18n/messages";
import { Alert } from "@/components/ui/alert";
import { buttonClasses } from "@/components/ui/button";

const MAX_SIDE = 1000;

// Shrinks the photo and re-saves it as a plain JPEG. This also drops hidden data such as GPS location.
async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("encode"))),
      "image/jpeg",
      0.9
    );
  });
}

export function SignatureUploader({
  clinicId,
  userId,
  currentUrl,
}: {
  clinicId: string;
  userId: string;
  currentUrl: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "danger"; key: MessageKey } | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage(null);

    try {
      if (!["image/png", "image/jpeg"].includes(file.type)) throw new Error("type");
      if (file.size > 15 * 1024 * 1024) throw new Error("size");

      const blob = await toJpeg(file);
      const supabase = createClient();

      const { error: uploadError } = await supabase.storage
        .from("signatures")
        .upload(`${clinicId}/${userId}`, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw new Error("upload");

      const { error: markError } = await supabase.rpc("mark_my_signature_uploaded");
      if (markError) throw new Error("mark");

      setMessage({ tone: "success", key: "settings.signature.saved" });
      router.refresh();
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown";
      setMessage({
        tone: "danger",
        key:
          reason === "type"
            ? "settings.signature.errType"
            : reason === "size"
              ? "settings.signature.errSize"
              : "settings.signature.errSave",
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-32 items-center justify-center rounded-control border border-dashed border-line-strong bg-canvas p-4">
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentUrl}
            alt={t("settings.signature.alt")}
            className="max-h-28 w-auto max-w-full rounded-lg bg-white p-2"
          />
        ) : (
          <p className="text-base text-ink-faint">{t("settings.signature.none")}</p>
        )}
      </div>

      <p className="text-sm text-ink-faint">{t("settings.signature.tips")}</p>

      <input
        ref={inputRef}
        id="signature-file"
        type="file"
        accept="image/png,image/jpeg"
        onChange={onFile}
        disabled={busy}
        className="peer sr-only"
      />
      <label
        htmlFor="signature-file"
        className={`${buttonClasses(currentUrl ? "secondary" : "primary", "lg", true)} cursor-pointer peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
          busy ? "pointer-events-none opacity-50" : ""
        }`}
      >
        {busy
          ? t("settings.signature.saving")
          : currentUrl
            ? t("settings.signature.replace")
            : t("settings.signature.choose")}
      </label>

      {message && <Alert tone={message.tone}>{t(message.key)}</Alert>}
    </div>
  );
}
