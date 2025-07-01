import { create } from 'zustand';
import type { Shape } from '../shared/types/canvas';

interface ShapesState {
  shapes: Shape[];
  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, shape: Shape) => void;
  removeShape: (id: string) => void;
  clearShapes: () => void;
}

export const useShapesStore = create<ShapesState>((set, get) => ({
  shapes: [],
  setShapes: (shapes) => set({ shapes }),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  updateShape: (id, shape) => set((state) => ({
    shapes: state.shapes.map((s) => (s.id === id ? shape : s)),
  })),
  removeShape: (id) => set((state) => ({
    shapes: state.shapes.filter((s) => s.id !== id),
  })),
  clearShapes: () => set({ shapes: [] }),
})); 