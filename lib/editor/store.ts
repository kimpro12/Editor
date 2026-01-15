"use client";

import { create } from "zustand";
import { Box } from "@/types/ingestion";

type HistoryState = {
  past: Box[][];
  future: Box[][];
};

type State = {
  boxes: Box[];
  selectedId: string | null;
  history: HistoryState;

  // base
  setBoxes: (boxes: Box[]) => void;
  select: (id: string | null) => void;

  // editing
  addBox: (preset?: Partial<Omit<Box, "id">>) => string;
  updateBox: (id: string, patch: Partial<Box>) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  nudgeSelected: (dx: number, dy: number) => void;

  // QC/caption helpers
  setSelectedCaption: (id: string, caption: string) => void;
  toggleIgnoreWarning: (id: string) => void;

  // history
  undo: () => void;
  redo: () => void;
};

function commit(set: any, get: any, nextBoxes: Box[]) {
  const cur = get().boxes as Box[];
  set((s: State) => ({
    boxes: nextBoxes,
    history: {
      past: [...s.history.past, cur],
      future: [],
    },
  }));
}

function safeUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `b_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export const useEditorStore = create<State>((set, get) => ({
  boxes: [],
  selectedId: null,
  history: { past: [], future: [] },

  setBoxes: (boxes) =>
    set(() => ({
      boxes,
      history: { past: [], future: [] },
      selectedId: null,
    })),

  select: (id) => set({ selectedId: id }),

  addBox: (preset) => {
    const id = safeUUID();
    const next: Box = {
      id,
      x: 20,
      y: 20,
      w: 64,
      h: 64,
      ...preset,
    };
    commit(set, get, [...get().boxes, next]);
    set({ selectedId: id });
    return id;
  },

  updateBox: (id, patch) => {
    const cur = get().boxes;
    const next = cur.map((b) => (b.id === id ? { ...b, ...patch } : b));
    commit(set, get, next);
  },

  deleteSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    const cur = get().boxes;
    const next = cur.filter((b) => b.id !== id);
    commit(set, get, next);
    set({ selectedId: null });
  },

  duplicateSelected: () => {
    const id = get().selectedId;
    if (!id) return;
    const cur = get().boxes;
    const src = cur.find((b) => b.id === id);
    if (!src) return;
    const newId = safeUUID();
    const dup: Box = { ...src, id: newId, x: src.x + 10, y: src.y + 10 };
    commit(set, get, [...cur, dup]);
    set({ selectedId: newId });
  },

  nudgeSelected: (dx, dy) => {
    const id = get().selectedId;
    if (!id) return;
    const cur = get().boxes;
    const next = cur.map((b) => (b.id === id ? { ...b, x: b.x + dx, y: b.y + dy } : b));
    commit(set, get, next);
  },

  setSelectedCaption: (id, caption) => {
    const cur = get().boxes;
    const next = cur.map((b) => (b.id === id ? { ...b, caption } : b));
    commit(set, get, next);
  },

  toggleIgnoreWarning: (id) => {
    const cur = get().boxes;
    const next = cur.map((b) => (b.id === id ? { ...b, ignore_warning: !b.ignore_warning } : b));
    commit(set, get, next);
  },

  undo: () => {
    const { past, future } = get().history;
    if (!past.length) return;
    const prev = past[past.length - 1];
    const cur = get().boxes;
    set((s: State) => ({
      boxes: prev,
      history: { past: past.slice(0, -1), future: [cur, ...future] },
      selectedId: s.selectedId && prev.some((b) => b.id === s.selectedId) ? s.selectedId : null,
    }));
  },

  redo: () => {
    const { past, future } = get().history;
    if (!future.length) return;
    const next = future[0];
    const cur = get().boxes;
    set((s: State) => ({
      boxes: next,
      history: { past: [...past, cur], future: future.slice(1) },
      selectedId: s.selectedId && next.some((b) => b.id === s.selectedId) ? s.selectedId : null,
    }));
  },
}));
