import React, { memo } from 'react';
import cn from 'classnames';

import styles from './style.module.scss';

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

interface ColorPickerProps {
  selectedColor: string;
  // eslint-disable-next-line no-unused-vars
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) =>
  <div className={styles.colorPicker}>
    {COLORS.map(color => (
      <button
        key={color}
        className={cn(styles.colorSwatch, { [styles.selected]: selectedColor === color })}
        style={{ backgroundColor: color }}
        onClick={() => onColorChange(color)}
        aria-label={`Select color ${color}`}
        type="button"
      />
    ))}
  </div>;

export default memo(ColorPicker); 
