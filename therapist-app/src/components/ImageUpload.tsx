"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function ImageUpload({ value, onChange, label, description }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB.");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `profiles/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('therapist-profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('therapist-profiles')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(error.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const onRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 w-full">
      {label && (
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          {label}
        </label>
      )}
      
      <div className="flex flex-col items-center justify-center gap-6 p-8 md:p-12 border-2 border-dashed border-outline-variant/30 rounded-[2.5rem] md:rounded-[3rem] bg-linear-to-br from-surface-container-lowest to-surface-container-low/50 hover:border-primary/50 transition-all duration-700 group min-h-[260px] md:min-h-[340px] shadow-sm hover:shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        {value ? (
          <div className="relative w-full aspect-square max-w-[240px] rounded-[2rem] overflow-hidden shadow-2xl border border-outline-variant/20 group/preview">
            <img 
              src={value} 
              alt="Upload Preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('ui-avatars.com')) {
                  target.src = `https://ui-avatars.com/api/?name=User&background=f8f9fa&color=5f43b2&size=400`;
                }
              }}
            />
            <button
              onClick={onRemove}
              className="absolute top-4 right-4 p-2 bg-red-500/90 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg backdrop-blur-sm opacity-0 group-hover/preview:opacity-100 scale-90 group-hover/preview:scale-100"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 cursor-pointer w-full py-4"
          >
            <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all duration-500 shadow-inner">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>
            <div className="text-center relative z-10">
              <p className="text-base font-heading font-medium text-foreground/90 group-hover:text-primary transition-colors duration-300">
                {isUploading ? "Uploading..." : "Click to upload your photo"}
              </p>
              <p className="text-[10px] text-muted-foreground/40 font-bold mt-2 uppercase tracking-[0.2em]">
                High Resolution PNG or JPG
              </p>
            </div>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>
      
      {description && (
        <p className="text-[10px] text-muted-foreground/50 font-medium px-2">
          {description}
        </p>
      )}

    </div>
  );
}
