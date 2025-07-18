import { forwardRef } from 'react';

import styles from './style.module.scss';
import { useCanvasWrapper } from './useCanvasWrapper';
import { Draftly } from '../classes/Draftly';

interface DraftlyWrapperProps {
  onShapesUpdate: (action?: 'add' | 'update' | 'delete', shape?: any, shapeId?: string) => void;
}

export const DraftlyWrapper = forwardRef<Draftly, DraftlyWrapperProps>(({ onShapesUpdate }, ref) => {
  const {
    setCanvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useCanvasWrapper(ref, onShapesUpdate);

  return (
    <div className={styles.canvasWrapper}>
      <canvas
        ref={setCanvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      />
    </div>
  );
}); 
