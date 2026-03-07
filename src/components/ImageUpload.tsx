"use client";

import { useRef, useState } from "react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const MAX_SIZE_MB = 10;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다.`);
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setUploadError("Cloudinary 설정이 없습니다. 환경 변수를 확인해 주세요.");
      return;
    }

    setUploadError("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "bandinity/venues");

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(xhr.responseText));
          }
        };
        xhr.onerror = () => reject(new Error("네트워크 오류"));
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.send(formData);
      });

      onChange(result.secure_url);
    } catch (err) {
      console.error(err);
      setUploadError("업로드 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    onChange("");
    setUploadError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      {/* 미리보기 */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="대표 이미지 미리보기"
            className="h-36 w-full max-w-xs rounded-xl object-cover shadow-sm"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-xs text-white shadow hover:bg-red-500 dark:bg-zinc-600 dark:hover:bg-red-600"
            aria-label="이미지 삭제"
          >
            ×
          </button>
        </div>
      )}

      {/* 업로드 영역 */}
      {!value && (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition
            ${
              uploading
                ? "border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-900/20"
                : "border-zinc-300 bg-zinc-50 hover:border-primary-400 hover:bg-primary-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-primary-600 dark:hover:bg-primary-900/20"
            }`}
        >
          {uploading ? (
            <>
              <div className="h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-primary-400 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm text-primary-700 dark:text-primary-400">
                업로드 중… {progress}%
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl">📷</span>
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                사진을 선택하거나 드래그하세요
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                JPG, PNG, WEBP · 최대 {MAX_SIZE_MB}MB
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
      )}

      {/* 이미지가 있을 때 교체 버튼 */}
      {value && !uploading && (
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          사진 교체
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {uploadError && (
        <p className="text-xs text-red-500 dark:text-red-400">{uploadError}</p>
      )}
    </div>
  );
}
