import { forwardRef } from 'react';
import styles from './style.module.scss';
import { useCanvasWrapper } from './useCanvasWrapper';
import { Draftly } from '../classes/Draftly';

export const DraftlyWrapper = forwardRef<Draftly>((_, ref) => {
  const {
    setCanvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
  } = useCanvasWrapper(ref);

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
