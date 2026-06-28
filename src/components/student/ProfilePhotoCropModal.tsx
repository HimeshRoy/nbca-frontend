"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImage } from "@/utils/cropImage";

interface ProfilePhotoCropModalProps {
  open: boolean;
  image: string;
  onClose: () => void;

  onSave: (blob: Blob, preview: string) => void;
}

export default function ProfilePhotoCropModal({
  open,
  image,
  onClose,
  onSave,
}: ProfilePhotoCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });

  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleSave = async () => {
  if (!croppedAreaPixels) return;

  const blob = await getCroppedImage(
    image,
    croppedAreaPixels,
  );

  if (!blob) return;

  const preview = URL.createObjectURL(blob);

  onSave(blob, preview);

  onClose();
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-[35px] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Adjust Profile Photo</h2>

          <button onClick={onClose} className="text-2xl font-bold">
            ✕
          </button>
        </div>

        <div className="relative mt-6 h-80 overflow-hidden rounded-3xl bg-slate-100">
          <Cropper
            image={image}
            aspect={1}
            cropShape="round"
            showGrid={false}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedPixels) =>
              setCroppedAreaPixels(croppedPixels)
            }
          />
        </div>
        <div className="mt-6">

  <label className="mb-2 block text-sm font-semibold">
    Zoom
  </label>

  <input title="range"
    type="range"
    min={1}
    max={3}
    step={0.1}
    value={zoom}
    onChange={(e) =>
      setZoom(Number(e.target.value))
    }
    className="w-full accent-violet-600"
  />

</div>

<div className="mt-8 flex gap-4">

  <button
    onClick={onClose}
    className="flex-1 rounded-2xl bg-slate-200 py-3 font-semibold"
  >
    Cancel
  </button>

  <button
    onClick={handleSave}
    className="flex-1 rounded-2xl bg-violet-600 py-3 font-semibold text-white"
  >
    Save
  </button>

</div>
      </div>
    </div>
  );
}
