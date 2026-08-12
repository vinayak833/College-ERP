import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCw, Check, X, Move, Sparkles } from "lucide-react";

export default function ImageCropperModal({ imageSrc, onCropComplete, onCancel, title = "Crop Profile Picture" }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState(null);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset pan when zoom changes if needed or keep inside bounds
  useEffect(() => {
    generatePreview();
  }, [zoom, rotation, pan, imageSrc]);

  // Handle Drag / Pan
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support for mobile devices
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    const zoomStep = 0.08;
    const delta = e.deltaY > 0 ? -zoomStep : zoomStep;
    setZoom((prev) => Math.min(Math.max(1, +(prev + delta).toFixed(2)), 3));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Generate cropped base64 image on canvas
  const getCroppedCanvas = () => {
    const img = imageRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;

    const outputSize = 400; // Output high-res 400x400 avatar
    const cropBoxSize = 240; // Size of circular crop window in DOM

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    // Clear background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outputSize, outputSize);

    // Calculate natural image dimensions and display scale in 240x240 box
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;

    // In DOM, <img style={{ maxHeight: '100%', maxWidth: '100%' }}> fits inside 240x240 box
    const baseScale = Math.min(cropBoxSize / nw, cropBoxSize / nh);
    const baseDisplayW = nw * baseScale;
    const baseDisplayH = nh * baseScale;

    // Scale factor from 240px DOM box to 400px output canvas
    const displayToCanvasScale = outputSize / cropBoxSize;

    // Scaled dimensions on canvas
    const drawWidth = baseDisplayW * zoom * displayToCanvasScale;
    const drawHeight = baseDisplayH * zoom * displayToCanvasScale;

    // Save context state
    ctx.save();

    // Move to panned center on canvas
    const centerX = (outputSize / 2) + (pan.x * displayToCanvasScale);
    const centerY = (outputSize / 2) + (pan.y * displayToCanvasScale);

    ctx.translate(centerX, centerY);
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw image centered at the translated & rotated origin
    ctx.drawImage(
      img,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );

    ctx.restore();
    return canvas;
  };

  const generatePreview = () => {
    const canvas = getCroppedCanvas();
    if (canvas) {
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    }
  };

  const handleSave = () => {
    const canvas = getCroppedCanvas();
    if (canvas) {
      const croppedData = canvas.toDataURL("image/jpeg", 0.88);
      onCropComplete(croppedData);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{title}</h3>
              <p className="text-xs text-slate-500">Drag to position, scroll or slider to zoom</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropping Canvas Viewport */}
        <div className="p-6 flex flex-col items-center justify-center bg-slate-900 relative select-none overflow-hidden">
          {/* Crop Container Box */}
          <div
            ref={containerRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative w-[240px] h-[240px] rounded-full overflow-hidden border-4 border-white/80 shadow-2xl cursor-grab active:cursor-grabbing bg-slate-800 flex items-center justify-center group"
          >
            {/* Dark Mask overlay around crop area hint */}
            <div className="absolute inset-0 rounded-full border-2 border-indigo-400/60 z-20 pointer-events-none group-hover:border-indigo-400 transition-colors" />

            {/* Hidden loaded original image element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={generatePreview}
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain"
              }}
              className="pointer-events-none"
            />

            {/* Drag helper hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-medium text-white/90 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Move className="w-3 h-3 text-indigo-400" />
              <span>Drag to move</span>
            </div>
          </div>

          {/* Real-time Circular Preview Thumb */}
          {previewUrl && (
            <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 z-30">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500 shadow-lg overflow-hidden bg-white">
                <img src={previewUrl} alt="Mini preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Preview</span>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-slate-500 shrink-0" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <ZoomIn className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-600 w-10 text-right font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
            <button
              type="button"
              onClick={handleRotate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors shadow-sm"
            >
              <RotateCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Rotate 90°</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setPan({ x: 0, y: 0 });
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Reset Position
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Crop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
