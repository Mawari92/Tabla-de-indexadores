import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toPng } from "html-to-image";
import {
  ArrowDown,
  ArrowUp,
  Award,
  Camera,
  Download,
  Medal,
  Plus,
  SlidersHorizontal,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { formatNumber, makeId, type Indexer } from "@/components/leaderboard/types";
import { PhotoAdjustModal } from "@/components/leaderboard/PhotoAdjustModal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tabla de Miembros Indexadores | Editor y exportador PNG" },
      {
        name: "description",
        content:
          "Crea y edita la tabla mensual de miembros indexadores: nombres, fotos, registros y posiciones. Exporta todo como imagen PNG en un clic.",
      },
      { property: "og:title", content: "Tabla de Miembros Indexadores" },
      {
        property: "og:description",
        content:
          "Editor de la tabla de indexadores con fotos, posiciones, total automático y exportación a PNG.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const initialPeople: Indexer[] = [
  { id: makeId(), name: "Guillermo Pérez", count: 8163, photo: null },
  { id: makeId(), name: "Adriana de García", count: 2595, photo: null },
  { id: makeId(), name: "Gustavo Méndez", count: 573, photo: null },
  { id: makeId(), name: "Mauricio Conde", count: 512, photo: null },
  { id: makeId(), name: "Laura Rodríguez", count: 172, photo: null },
  { id: makeId(), name: "Clara de Méndez", count: 43, photo: null },
];

function DynamicTextarea({
  value,
  onChange,
  className = "",
  placeholder = "",
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full resize-none overflow-hidden bg-transparent rounded-md outline-none transition-colors focus:bg-accent/60 ${className}`}
    />
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function Avatar({
  person,
  size,
  onPick,
  onOpenAdjust,
}: {
  person: Indexer;
  size: number;
  onPick: (dataUrl: string) => void;
  onOpenAdjust?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const zoom = person.zoom ?? 1;
  const offsetX = person.offsetX ?? 0;
  const offsetY = person.offsetY ?? 0;
  const rotation = person.rotation ?? 0;

  const baseSize = 200;
  const scaleFactor = size / baseSize;
  const scaledX = offsetX * scaleFactor;
  const scaledY = offsetY * scaleFactor;

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onPick(String(reader.result));
      if (onOpenAdjust) {
        setTimeout(() => onOpenAdjust(), 100);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex shrink-0 flex-col items-center gap-1">
      <div
        className="relative shrink-0 overflow-hidden rounded-full border-[3px] border-brand bg-accent group"
        style={{ width: size, height: size }}
      >
        {person.photo ? (
          <img
            src={person.photo}
            alt={`Foto de ${person.name}`}
            className="h-full w-full object-cover select-none pointer-events-none"
            style={{
              transform: `translate(${scaledX}px, ${scaledY}px) scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center",
            }}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center font-display text-brand-dark select-none"
            style={{ fontSize: size / 3 }}
          >
            {initials(person.name) || "?"}
          </div>
        )}

        <div
          data-noexport
          className="absolute inset-0 flex items-center justify-center gap-1.5 bg-brand-dark/60 opacity-0 transition-opacity group-hover:opacity-100 p-1"
        >
          {person.photo && onOpenAdjust ? (
            <>
              <button
                type="button"
                onClick={onOpenAdjust}
                className="flex items-center justify-center rounded-full bg-brand text-brand-foreground p-1.5 hover:scale-110 transition-transform shadow-xs cursor-pointer"
                title="Ajustar, mover o rotar foto"
                aria-label={`Ajustar foto de ${person.name}`}
              >
                <SlidersHorizontal style={{ width: size / 4, height: size / 4 }} />
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex items-center justify-center rounded-full bg-card/90 text-brand-dark p-1.5 hover:scale-110 transition-transform shadow-xs cursor-pointer"
                title="Cambiar foto"
                aria-label={`Cambiar foto de ${person.name}`}
              >
                <Camera style={{ width: size / 4, height: size / 4 }} />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-full w-full items-center justify-center text-brand-foreground cursor-pointer"
              aria-label={`Subir foto de ${person.name}`}
            >
              <Camera style={{ width: size / 3.5, height: size / 3.5 }} />
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          data-noexport
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {person.photo && onOpenAdjust ? (
        <button
          type="button"
          data-noexport
          onClick={onOpenAdjust}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand hover:underline cursor-pointer"
        >
          <SlidersHorizontal className="h-3 w-3" /> Encuadrar
        </button>
      ) : null}
    </div>
  );
}

function CountField({
  value,
  onChange,
  className = "w-full bg-transparent text-center font-display text-xl outline-none",
}: {
  value: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      inputMode="numeric"
      value={focused ? String(value) : formatNumber(value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(/[^0-9]/g, "")) || 0))}
      className={className}
      aria-label="Cantidad de registros"
    />
  );
}

function Index() {
  const [title, setTitle] = useState("TABLA DE MIEMBROS INDEXADORES");
  const [period, setPeriod] = useState("JULIO 2026");
  const [place, setPlace] = useState("BARRIO NUEVA BARCELONA");
  const [featuredRankText, setFeaturedRankText] = useState("#1");
  const [featuredLabel, setFeaturedLabel] = useState("Indexador destacado del mes de");
  const [monthNote, setMonthNote] = useState("Julio - 2026");
  const [recordsLabel, setRecordsLabel] = useState("REGISTROS");
  const [itemRecordsLabel, setItemRecordsLabel] = useState("Registros");
  const [totalNote, setTotalNote] = useState("Nombres indexados durante el mes de Julio.");
  const [thanks, setThanks] = useState("Gracias por su gran aporte y servicio.");
  const [people, setPeople] = useState<Indexer[]>(initialPeople);
  const [adjustingPerson, setAdjustingPerson] = useState<Indexer | null>(null);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const ranked = useMemo(() => people, [people]);
  const total = useMemo(
    () => people.reduce((sum, p) => sum + (Number.isFinite(p.count) ? p.count : 0), 0),
    [people],
  );
  const leader = ranked[0];

  const update = (id: string, patch: Partial<Indexer>) =>
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const move = (index: number, dir: -1 | 1) =>
    setPeople((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      const a = next[index]!;
      next[index] = next[target]!;
      next[target] = a;
      return next;
    });

  const sortByCount = () => setPeople((prev) => [...prev].sort((a, b) => b.count - a.count));

  const addPerson = () =>
    setPeople((prev) => [
      ...prev,
      { id: makeId(), name: "Nuevo indexador", count: 0, photo: null },
    ]);

  const removePerson = (id: string) => setPeople((prev) => prev.filter((p) => p.id !== id));

  const exportPng = async () => {
    const node = cardRef.current;
    if (!node) return;
    setExporting(true);
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const width = Math.ceil(node.scrollWidth);
      const height = Math.ceil(node.scrollHeight);
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#f3f5fa",
        width,
        height,
        style: { width: `${width}px`, height: `${height}px` },
        filter: (n) => !(n instanceof HTMLElement && n.dataset["noexport"] !== undefined),
      });
      const link = document.createElement("a");
      link.download = `indexadores-${period.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  const inputBase =
    "w-full bg-transparent outline-none focus:bg-accent/60 rounded-md transition-colors";

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-[1180px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl text-brand-dark">Editor de la tabla</h1>
            <p className="text-sm text-muted-foreground">
              Haz clic en cualquier texto para editarlo. El total en rojo se calcula solo.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={sortByCount}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-accent cursor-pointer"
            >
              Ordenar por registros
            </button>
            <button
              type="button"
              onClick={addPerson}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-accent cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Añadir indexador
            </button>
            <button
              type="button"
              onClick={exportPng}
              disabled={exporting}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exportando…" : "Exportar PNG"}
            </button>
          </div>
        </header>

        <div ref={cardRef} className="rounded-3xl bg-[#f3f5fa] p-4">
          {/* Encabezado */}
          <div className="card-panel mb-4 flex items-center gap-5 px-6 py-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand text-3xl font-display text-brand-foreground">
              !
            </div>
            <div className="min-w-0 flex-1">
              <DynamicTextarea
                value={title}
                onChange={(e) => setTitle(e)}
                className="font-display text-3xl leading-tight text-brand-dark md:text-4xl"
              />
              <div className="mt-1 flex flex-wrap items-center gap-1.5 font-display text-sm font-bold text-brand">
                <label className="inline-grid">
                  <span className="invisible whitespace-pre [grid-area:1/1] px-0.5 font-display text-sm font-bold">
                    {period || " "}
                  </span>
                  <input
                    size={1}
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full [grid-area:1/1] rounded-md bg-transparent px-0.5 font-display text-sm font-bold text-brand outline-none transition-colors focus:bg-accent/60"
                  />
                </label>
                <span className="text-gold select-none font-bold">●</span>
                <label className="inline-grid">
                  <span className="invisible whitespace-pre [grid-area:1/1] px-0.5 font-display text-sm font-bold">
                    {place || " "}
                  </span>
                  <input
                    size={1}
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    className="w-full [grid-area:1/1] rounded-md bg-transparent px-0.5 font-display text-sm font-bold text-brand outline-none transition-colors focus:bg-accent/60"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:items-start">
            {/* Destacado */}
            <section className="card-panel flex flex-col items-center px-6 py-6 text-center">
              <div className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand py-2 font-display text-2xl text-brand-foreground">
                <Medal className="h-6 w-6 shrink-0 text-gold" />
                <label className="inline-grid">
                  <span className="invisible whitespace-pre [grid-area:1/1] px-0.5 font-display text-2xl text-brand-foreground">
                    {featuredRankText || " "}
                  </span>
                  <input
                    size={1}
                    value={featuredRankText}
                    onChange={(e) => setFeaturedRankText(e.target.value)}
                    className="w-full [grid-area:1/1] rounded-md bg-transparent px-0.5 text-center font-display text-2xl text-brand-foreground outline-none transition-colors focus:bg-accent/20"
                  />
                </label>
              </div>
              {leader ? (
                <>
                  <div className="relative mt-6">
                    <Avatar
                      person={leader}
                      size={200}
                      onPick={(photo) => update(leader.id, { photo })}
                      onOpenAdjust={() => setAdjustingPerson(leader)}
                    />
                    <div className="absolute -right-1 top-2 flex h-14 w-14 items-center justify-center rounded-full border-4 border-panel bg-gold text-brand-dark shadow-md">
                      <Award className="h-8 w-8" />
                    </div>
                  </div>
                  <DynamicTextarea
                    value={leader.name}
                    onChange={(val) => update(leader.id, { name: val })}
                    className="mt-5 text-center font-display text-2xl text-brand-dark"
                  />
                  <div className="mt-3 w-full rounded-xl bg-brand px-4 py-3 text-brand-foreground">
                    <CountField
                      value={leader.count}
                      onChange={(count) => update(leader.id, { count })}
                      className="w-full bg-transparent text-center font-display text-3xl font-extrabold text-brand-foreground outline-none"
                    />
                    <DynamicTextarea
                      value={recordsLabel}
                      onChange={(val) => setRecordsLabel(val)}
                      className="text-center font-display text-xs font-semibold uppercase tracking-widest text-brand-foreground"
                    />
                  </div>
                  <DynamicTextarea
                    value={featuredLabel}
                    onChange={(val) => setFeaturedLabel(val)}
                    className="mt-4 text-center font-display text-base font-bold text-brand-dark md:text-lg"
                  />
                  <DynamicTextarea
                    value={monthNote}
                    onChange={(val) => setMonthNote(val)}
                    className="text-center font-display text-base font-bold text-brand md:text-lg"
                  />
                </>
              ) : (
                <p className="py-10 text-sm text-muted-foreground">
                  Añade un indexador para comenzar.
                </p>
              )}
            </section>

            {/* Lista */}
            <section className="card-panel divide-y divide-border px-5 py-3">
              {ranked.map((person, index) => (
                <div key={person.id} className="flex items-center gap-4 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand font-display text-xl text-brand-foreground">
                    {index + 1}
                  </div>
                  <Avatar
                    person={person}
                    size={64}
                    onPick={(photo) => update(person.id, { photo })}
                    onOpenAdjust={() => setAdjustingPerson(person)}
                  />
                  {index === 0 ? (
                    <Medal className="h-6 w-6 shrink-0 text-gold" aria-label="Primer lugar" />
                  ) : null}
                  <DynamicTextarea
                    value={person.name}
                    onChange={(val) => update(person.id, { name: val })}
                    className="flex-1 font-display text-lg text-brand-dark"
                  />
                  <span className="text-2xl text-gold">★</span>
                  <div className="w-[140px] shrink-0 rounded-lg bg-brand px-3 py-2 text-center text-brand-foreground">
                    <CountField
                      value={person.count}
                      onChange={(count) => update(person.id, { count })}
                    />
                    <DynamicTextarea
                      value={itemRecordsLabel}
                      onChange={(val) => setItemRecordsLabel(val)}
                      className="text-center text-[11px] text-brand-foreground"
                    />
                  </div>
                  <div data-noexport className="flex shrink-0 flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      className="rounded-md border border-border p-1 text-brand-dark hover:bg-accent cursor-pointer"
                      aria-label="Subir posición"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      className="rounded-md border border-border p-1 text-brand-dark hover:bg-accent cursor-pointer"
                      aria-label="Bajar posición"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    data-noexport
                    onClick={() => removePerson(person.id)}
                    className="shrink-0 rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10 cursor-pointer"
                    aria-label="Eliminar indexador"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </section>
          </div>

          {/* Pie */}
          <div className="card-panel mt-4 grid grid-cols-1 items-center gap-6 px-8 py-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                <TrendingUp className="h-8 w-8" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-4xl font-extrabold text-emerald-600">
                  {formatNumber(total)}
                </div>
                <DynamicTextarea
                  value={totalNote}
                  onChange={(val) => setTotalNote(val)}
                  className="font-display text-base text-brand-dark"
                />
              </div>
            </div>
            <div className="hidden h-14 w-px bg-border md:block" />
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent text-brand">
                <Users className="h-8 w-8" />
              </div>
              <DynamicTextarea
                value={thanks}
                onChange={(val) => setThanks(val)}
                className="font-display text-base text-brand-dark"
              />
            </div>
          </div>
        </div>
      </div>

      <PhotoAdjustModal
        person={adjustingPerson}
        open={!!adjustingPerson}
        onOpenChange={(open) => {
          if (!open) setAdjustingPerson(null);
        }}
        onSave={(id, patch) => update(id, patch)}
        onPickNewPhoto={(id, photo) => update(id, { photo })}
        onRemovePhoto={(id) =>
          update(id, { photo: null, zoom: 1, offsetX: 0, offsetY: 0, rotation: 0 })
        }
      />
    </main>
  );
}
