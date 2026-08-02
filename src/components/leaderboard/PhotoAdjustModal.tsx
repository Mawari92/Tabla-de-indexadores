import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Check,
  Move,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Indexer } from "./types";

interface PhotoAdjustModalProps {
  person: Indexer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, patch: Partial<Indexer>) => void;
  onPickNewPhoto: (id: string, dataUrl: string) => void;
  onRemovePhoto: (id: string) => void;
}

export function PhotoAdjustModal({
  person,
  open,
  onOpenChange,
  onSave,
  onPickNewPhoto,
  onRemovePhoto,
}: PhotoAdjustModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (person && open) {
      setZoom(person.zoom ?? 1);
      setOffsetX(person.offsetX ?? 0);
      setOffsetY(person.offsetY ?? 0);
      setRotation(person.rotation ?? 0);
    }
  }, [person, open]);

  if (!person) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!person.photo) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offsetX,
      oy: offsetY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setOffsetX(Math.round(dragStartRef.current.ox + dx));
    setOffsetY(Math.round(dragStartRef.current.oy + dy));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // pointer capture already released
      }
      setIsDragging(false);
      dragStartRef.current = null;
    }
  };

  const rotateBy = (deg: number) => {
    setRotation((prev) => {
      let next = (prev + deg) % 360;
      if (next > 180) next -= 360;
      if (next < -180) next += 360;
      return next;
    });
  };

  const handleFileChange = (file?: File) => {
    if (!file || !person) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      onPickNewPhoto(person.id, dataUrl);
      // reset adjustment values for new photo
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(person.id, {
      zoom,
      offsetX,
      offsetY,
      rotation,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-4 p-6 sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-brand-dark">
            Encuadrar y Ajustar Foto
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ajusta la foto de <strong className="text-brand-dark">{person.name}</strong>. Arrastra
            directamente el círculo para moverla, o usa los controles de abajo.
          </DialogDescription>
        </DialogHeader>

        {/* Círculo de vista previa interactivo */}
        <div className="flex flex-col items-center justify-center py-2">
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative flex h-[200px] w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-brand bg-accent shadow-md transition-shadow select-none touch-none ${
              person.photo
                ? isDragging
                  ? "cursor-grabbing ring-4 ring-brand/30"
                  : "cursor-grab"
                : ""
            }`}
          >
            {person.photo ? (
              <img
                src={person.photo}
                alt={`Ajuste de ${person.name}`}
                className="h-full w-full object-cover pointer-events-none select-none"
                style={{
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Camera className="h-10 w-10 text-brand" />
                <span className="text-xs">Sin foto seleccionada</span>
              </div>
            )}
            {person.photo && (
              <div className="absolute bottom-2 rounded-full bg-brand-dark/75 px-3 py-1 text-[11px] font-semibold text-brand-foreground backdrop-blur-xs flex items-center gap-1.5 pointer-events-none">
                <Move className="h-3 w-3" /> Arrastra para mover
              </div>
            )}
          </div>
        </div>

        {person.photo ? (
          <div className="space-y-4 text-sm">
            {/* Controles de Rotación */}
            <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-brand" /> Rotación
                </span>
                <span className="font-mono text-brand">{rotation}°</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => rotateBy(-90)}
                  className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-brand-dark hover:bg-accent"
                  title="Girar 90° a la izquierda"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> -90°
                </button>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="h-2 flex-1 accent-brand cursor-pointer"
                  aria-label="Ángulo de rotación"
                />
                <button
                  type="button"
                  onClick={() => rotateBy(90)}
                  className="flex items-center gap-1 rounded-lg border border-border bg-background px-2 py-1 text-xs font-medium text-brand-dark hover:bg-accent"
                  title="Girar 90° a la derecha"
                >
                  <RotateCw className="h-3.5 w-3.5" /> +90°
                </button>
              </div>
            </div>

            {/* Controles de Zoom / Escala */}
            <div className="rounded-xl border border-border bg-card/60 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
                <span className="flex items-center gap-1.5">
                  <ZoomIn className="h-3.5 w-3.5 text-brand" /> Zoom / Escala
                </span>
                <span className="font-mono text-brand">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
                  className="rounded-lg border border-border bg-background p-1 text-brand-dark hover:bg-accent"
                  title="Alejar"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min={1}
                  max={3.5}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-2 flex-1 accent-brand cursor-pointer"
                  aria-label="Escala de zoom"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.1).toFixed(2))))}
                  className="rounded-lg border border-border bg-background p-1 text-brand-dark hover:bg-accent"
                  title="Acercar"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Posición fina y Reajustes */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => x - 5)}
                  className="rounded-md border border-border p-1.5 text-brand-dark hover:bg-accent"
                  title="Mover a la izquierda"
                >
                  <MoveLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => y - 5)}
                  className="rounded-md border border-border p-1.5 text-brand-dark hover:bg-accent"
                  title="Mover arriba"
                >
                  <MoveUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetY((y) => y + 5)}
                  className="rounded-md border border-border p-1.5 text-brand-dark hover:bg-accent"
                  title="Mover abajo"
                >
                  <MoveDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setOffsetX((x) => x + 5)}
                  className="rounded-md border border-border p-1.5 text-brand-dark hover:bg-accent"
                  title="Mover a la derecha"
                >
                  <MoveRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-brand-dark transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Restablecer posición
              </button>
            </div>
          </div>
        ) : null}

        {/* Acciones principales */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-brand-dark hover:bg-accent transition-colors"
            >
              <Camera className="h-3.5 w-3.5" />
              {person.photo ? "Cambiar foto" : "Subir foto"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />

            {person.photo && (
              <button
                type="button"
                onClick={() => {
                  onRemovePhoto(person.id);
                  onOpenChange(false);
                }}
                className="flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                title="Eliminar foto"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-brand-foreground shadow-xs hover:opacity-90 transition-opacity"
          >
            <Check className="h-3.5 w-3.5" />
            Listo
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
