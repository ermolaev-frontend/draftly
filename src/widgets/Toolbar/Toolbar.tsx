import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faBroom, faMoon, faLightbulb } from '@fortawesome/free-solid-svg-icons';

import type { ToolType } from 'shared/types/canvas';

import styles from './Toolbar.module.scss';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  activeColor: string;
  onColorChange: (color: string) => void;
  onClearCanvas?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const toolButtons = [
  { tool: 'rectangle', icon: faSquareRegular, title: 'Rectangle' },
  { tool: 'circle', icon: faCircleRegular, title: 'Circle' },
  { tool: 'ellipse', icon: faCircleRegular, title: 'Ellipse' },
  { tool: 'line', icon: faSlash, title: 'Line' },
  { tool: 'select', icon: faArrowPointer, title: 'Select' },
  { tool: 'pencil', icon: faPencil, title: 'Pencil' },
];

const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolChange,
  onClearCanvas,
  isDarkMode,
  onToggleDarkMode,
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
        className={styles.clearButton}
      >
        <FontAwesomeIcon icon={faBroom} />
      </button>
    )}
    {onToggleDarkMode && (
      <button
        onClick={onToggleDarkMode}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={styles.toolbarButton}
        style={{ marginTop: 48 }}
      >
        <FontAwesomeIcon icon={isDarkMode ? faLightbulb : faMoon} />
      </button>
    )}
  </div>
);

export default memo(Toolbar); 
