import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Shape } from '../shared/types/canvas';

interface ShapesState {
  shapes: Shape[];
}

const initialState: ShapesState = {
  shapes: [],
};

const shapesSlice = createSlice({
  name: 'shapes',
  initialState,
  reducers: {
    setShapes(state, action: PayloadAction<Shape[]>) {
      state.shapes = action.payload;
    },
    addShape(state, action: PayloadAction<Shape>) {
      state.shapes.push(action.payload);
    },
    updateShape(state, action: PayloadAction<{ id: string; shape: Shape }>) {
      const { id, shape } = action.payload;
      const index = state.shapes.findIndex(s => s.id === id);
      if (index !== -1) {
        state.shapes[index] = shape;
      }
    },
    removeShape(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.shapes = state.shapes.filter(s => s.id !== id);
    },
    clearShapes(state) {
      state.shapes = [];
    },
  },
});

export const { setShapes, addShape, updateShape, removeShape, clearShapes } = shapesSlice.actions;
export default shapesSlice.reducer; 