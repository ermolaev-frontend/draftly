import React from 'react';

import styles from './ZoomPanel.module.scss';

interface ZoomPanelProps {
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  onZoomChange: (zoom: number) => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const ZoomPanel: React.FC<ZoomPanelProps> = ({ zoom, minZoom = 0.1, maxZoom = 5, onZoomChange }) => {
  const handleZoom = (delta: number) => {
    const newZoom = clamp(zoom + delta, minZoom, maxZoom);
    onZoomChange(newZoom);
  };

  return (
    <div className={styles.zoomPanel}>
      <button className={styles.button} onClick={() => handleZoom(-0.1)} disabled={zoom <= minZoom}>-</button>
      <span className={styles.value}>{Math.round(zoom * 100)}%</span>
      <button className={styles.button} onClick={() => handleZoom(0.1)} disabled={zoom >= maxZoom}>+</button>
    </div>
  );
};

export default React.memo(ZoomPanel); 
