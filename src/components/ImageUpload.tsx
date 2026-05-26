"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { XIcon } from "lucide-react";

interface ImageUploadProps {
  onChange: (urls: string[]) => void;
  value: string[];
  endpoint: "imageUploader";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {value.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-md border border-border/30"
            >
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                onClick={() => {
                  onChange(value.filter((_, i) => i !== index));
                }}
                className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black/90 rounded-full transition-colors"
              >
                <XIcon className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < 6 && (
        <UploadDropzone
          endpoint={endpoint}
          onClientUploadComplete={(res) => {
            if (!res) return;

            const newUrls = res.map((file) => file.url);

            onChange([...value, ...newUrls]);
          }}
          onUploadError={(error: Error) => {
            console.log(error);
          }}
        />
      )}
    </div>
  );
}

export default ImageUpload;
