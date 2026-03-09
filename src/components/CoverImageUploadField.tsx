"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { publicEnv } from "@/lib/public-env";

interface CoverImageUploadFieldProps {
  initialImageUrl?: string;
}

export function CoverImageUploadField({
  initialImageUrl = "",
}: CoverImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleReplaceClick() {
    if (!imageUrl) {
      openPicker();
      return;
    }

    if (window.confirm("정말로 대표 이미지를 교체하시겠습니까?")) {
      openPicker();
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!publicEnv.cloudinaryCloudName || !publicEnv.cloudinaryUploadPreset) {
      setError("이미지 업로드 설정이 비어 있습니다.");
      return;
    }

    setIsUploading(true);
    setError("");
    setStatus("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", publicEnv.cloudinaryUploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${publicEnv.cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const payload = (await response.json()) as { secure_url?: string; error?: { message?: string } };

      if (!response.ok || !payload.secure_url) {
        throw new Error(payload.error?.message || "이미지 업로드에 실패했습니다.");
      }

      setImageUrl(payload.secure_url);
      setStatus("이미지 업로드 완료");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "이미지 업로드에 실패했습니다."
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {imageUrl ? (
        <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="relative aspect-[16/8] w-full">
            <Image
              src={imageUrl}
              alt="대표 이미지 미리보기"
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1100px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-black/6 to-transparent" />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              현재 대표 이미지가 설정되어 있습니다.
            </p>
            <button
              type="button"
              onClick={handleReplaceClick}
              disabled={isUploading}
              className="rounded-[8px] border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-primary-700 dark:hover:text-primary-300"
            >
              {isUploading ? "업로드 중" : "사진 교체"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          disabled={isUploading}
          className="flex aspect-[16/8] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-zinc-300 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(240,244,248,0.92))] text-center transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-[linear-gradient(180deg,rgba(22,25,32,0.95),rgba(15,17,23,0.98))] dark:hover:border-primary-700 dark:hover:text-primary-300"
        >
          <span className="text-5xl leading-none text-zinc-400 dark:text-zinc-500">+</span>
          <span className="mt-3 text-base font-semibold text-zinc-700 dark:text-zinc-200">
            대표 이미지 추가
          </span>
          <span className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            파일을 선택해서 바로 업로드합니다
          </span>
          {isUploading && (
            <span className="mt-3 text-sm font-medium text-primary-700 dark:text-primary-300">
              업로드 중...
            </span>
          )}
        </button>
      )}

      {status ? (
        <p className="text-sm text-emerald-600 dark:text-emerald-300">{status}</p>
      ) : null}
      {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
    </div>
  );
}
