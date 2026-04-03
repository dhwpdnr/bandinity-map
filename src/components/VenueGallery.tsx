"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { addVenuePhoto } from "@/lib/venues";
import { RADIUS_CONTROL, RADIUS_PANEL } from "@/lib/ui";

const MAX_SIZE_MB = 10;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

interface VenueGalleryProps {
  venueId: string;
  photos: string[];
}

export function VenueGallery({ venueId, photos }: VenueGalleryProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`);
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError("Cloudinary 설정이 없습니다.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", `bandinity/venues/${venueId}`);

    try {
      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(xhr.responseText));
        };
        xhr.onerror = () => reject(new Error("네트워크 오류"));
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.send(formData);
      });

      await addVenuePhoto(venueId, result.secure_url);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={`border border-white/10 bg-[rgba(11,14,20,0.92)] p-4 sm:p-6 ${RADIUS_PANEL}`}>
      <h2 className="mb-3 text-sm font-semibold text-zinc-100">
        사진 갤러리 {photos.length > 0 && `(${photos.length}장)`}
      </h2>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((url, i) => (
          <a
            key={`${url}-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`aspect-square overflow-hidden bg-[rgba(20,25,34,0.95)] ${RADIUS_CONTROL}`}
          >
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover"
            />
          </a>
        ))}

        {/* 업로드 버튼 */}
        <label
          className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed transition-colors duration-200 ${RADIUS_CONTROL}
            ${
              uploading
                ? "border-primary-400/70 bg-[rgba(100,197,218,0.12)]"
                : "border-white/16 bg-[rgba(16,21,30,0.65)] hover:border-primary-400/60 hover:bg-[rgba(100,197,218,0.1)]"
            }`}
        >
          {uploading ? (
            <>
              <div className="h-1 w-16 overflow-hidden rounded-full bg-white/14">
                <div
                  className="h-full rounded-full bg-primary-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-primary-400">{progress}%</span>
            </>
          ) : (
            <>
              <span className="text-2xl">+</span>
              <span className="text-xs font-medium text-zinc-400">
                사진 추가
              </span>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
