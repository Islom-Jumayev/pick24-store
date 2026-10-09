"use client";
import { useState, useRef } from "react";
import { supabase } from "../lib/supabase";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  recommendedSize?: string;
}

export default function ImageUpload({ value, onChange, folder = "products", recommendedSize }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fayl hajmini tekshirish (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Fayl hajmi 5MB dan katta bo'lmasligi kerak!");
      return;
    }

    // Fayl turini tekshirish
    if (!file.type.startsWith("image/")) {
      alert("Faqat rasm fayllarini yuklash mumkin!");
      return;
    }

    setUploading(true);

    try {
      // Fayl nomini yaratish (noyob)
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Supabase Storage'ga yuklash
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Public URL olish
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      if (urlData.publicUrl) {
        setPreview(urlData.publicUrl);
        onChange(urlData.publicUrl);
      }
    } catch (error: any) {
      alert("Xatolik: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-contain rounded-lg border border-gray-300 bg-gray-50"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 transition"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
        >
          <div className="text-4xl mb-2">📷</div>
          <p className="text-gray-600 font-medium">Rasm yuklash uchun bosing</p>
          <p className="text-gray-400 text-sm mt-1">JPG, PNG, WEBP (max 5MB)</p>
          {recommendedSize && (
            <p className="text-blue-500 text-xs mt-2 font-medium">
              📐 Tavsiya etilgan o'lcham: {recommendedSize}
            </p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm">Yuklanmoqda...</span>
        </div>
      )}
    </div>
  );
}