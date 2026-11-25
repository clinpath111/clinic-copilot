"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_SIDE = 1000;

async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("canvas");
  }

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

export function SignatureUploader(props: {
  clinicId: string;
  userId: string;
  currentUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

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
        .upload(`${props.clinicId}/${props.userId}`, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });
      if (uploadError) throw new Error("upload");

      const { error: markError } = await supabase.rpc("mark_my_signature_uploaded");
      if (markError) throw new Error("mark");

      setMessage({ kind: "ok", text: "Signature saved." });
      router.refresh();
    } catch (err) {
      const reason = err instanceof Error ? err.message : "unknown";
      setMessage({
        kind: "error",
        text:
          reason === "type"
            ? "Please choose a PNG or JPEG photo."
            : reason === "size"
              ? "That file is too large (15 MB maximum)."
              : "We could not save the signature. Please try again.",
      });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {props.currentUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={props.currentUrl}
          alt="Your saved signature"
          className="h-28 w-auto max-w-full self-start rounded-lg border border-gray-400 bg-white p-2"
        />
      ) : (
        <p className="text-base text-gray-600">No signature saved yet.</p>
      )}

      <p className="text-sm text-gray-600">
        Sign on plain white paper with a dark pen, then take a straight photo in good light.
        It is printed on every prescription you issue. Location data in the photo is removed
        before upload.
      </p>

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
        className="flex h-12 cursor-pointer items-center justify-center rounded-lg bg-black px-4 text-base font-medium text-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
      >
        {busy ? "Saving..." : props.currentUrl ? "Replace signature photo" : "Choose signature photo"}
      </label>

      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={message.kind === "error" ? "text-base text-red-700" : "text-base text-green-800"}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
