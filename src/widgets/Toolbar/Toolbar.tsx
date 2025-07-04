import React, { memo } from 'react';
import styles from './Toolbar.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faBroom, faMoon, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import type { ToolType } from 'shared/types/canvas';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onClearCanvas?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const toolButtons = [
  { tool: 'rectangle', icon: faSquareRegular, title: 'Rectangle' },
  { tool: 'circle', icon: faCircleRegular, title: 'Circle' },
  { tool: 'line', icon: faSlash, title: 'Line', iconProps: { rotation: 270 as const } },
  { tool: 'select', icon: faArrowPointer, title: 'Select' },
  { tool: 'pencil', icon: faPencil, title: 'Pencil' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onClearCanvas, isDarkMode, onToggleDarkMode }) => (
  <div className={styles.toolbar}>
    {toolButtons.map(({ tool, icon, title, iconProps }) => (
      <button
        key={tool}
        className={activeTool === tool ? `${styles.toolbarButton} ${styles.active}` : styles.toolbarButton}
        onClick={() => onToolChange(tool as ToolType)}
        title={title}
      >
        <FontAwesomeIcon icon={icon} {...(iconProps || {})} />
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
        style={{ marginTop: 16 }}
      >
        <FontAwesomeIcon icon={isDarkMode ? faLightbulb : faMoon} />
      </button>
    )}
  </div>
);

export default memo(Toolbar); 
