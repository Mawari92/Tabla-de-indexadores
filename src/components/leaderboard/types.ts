export type Indexer = {
  id: string;
  name: string;
  count: number;
  photo: string | null;
  zoom?: number;
  offsetX?: number;
  offsetY?: number;
  rotation?: number;
};

export const makeId = () => Math.random().toString(36).slice(2, 10);

export const formatNumber = (n: number) =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);
