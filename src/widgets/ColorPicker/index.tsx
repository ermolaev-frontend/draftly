import React, { memo } from 'react';
import cn from 'classnames';
import { BASE_PALETTE } from 'shared/types/colors';

import styles from './style.module.scss';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange }) =>
  <div className={styles.colorPicker}>
    {BASE_PALETTE.map(color => (
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
