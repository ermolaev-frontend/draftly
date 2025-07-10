import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faBroom, faMoon, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import cn from 'classnames';

import type { ToolType } from 'shared/types/canvas';

import ColorPicker from './ColorPicker';
import styles from './style.module.scss';

interface ToolbarProps {
  activeTool: ToolType;
  // eslint-disable-next-line no-unused-vars
  onToolChange: (tool: ToolType) => void;
  onClearCanvas?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  selectedColor: string;
  // eslint-disable-next-line no-unused-vars
  onColorChange: (color: string) => void;
}

const toolButtons = [
  { tool: 'rectangle', icon: faSquareRegular, title: 'Rectangle' },
  { tool: 'circle', icon: faCircleRegular, title: 'Circle' },
  { tool: 'line', icon: faSlash, title: 'Line' },
  { tool: 'select', icon: faArrowPointer, title: 'Select' },
  { tool: 'pencil', icon: faPencil, title: 'Pencil' },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onClearCanvas,
  isDarkMode,
  onToggleDarkMode,
  selectedColor,
  onColorChange,
}) => (
  <div className={styles.toolbar}>
    {toolButtons.map(({ tool, icon, title }) => (
      <button
        key={tool}
        className={
          activeTool === tool
            ? `${styles.toolbarButton} ${styles.active}`
            : styles.toolbarButton
        }
        onClick={() => onToolChange(tool as ToolType)}
        title={title}
      >
        <FontAwesomeIcon icon={icon} />
      </button>
    ))}
    {onClearCanvas && (
      <button
        onClick={onClearCanvas}
        title="Clear Canvas"
        className={cn(styles.clearButton, styles.toolbarButton)}
      >
        <FontAwesomeIcon icon={faBroom} />
      </button>
    )}
    {onToggleDarkMode && (
      <button
        onClick={onToggleDarkMode}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={styles.toolbarButton}
      >
        <FontAwesomeIcon icon={isDarkMode ? faLightbulb : faMoon} />
      </button>
    )}
    <ColorPicker selectedColor={selectedColor} onColorChange={onColorChange} />
  </div>
);

export default memo(Toolbar); 
