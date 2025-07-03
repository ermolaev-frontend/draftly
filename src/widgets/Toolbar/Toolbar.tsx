import React, { memo } from 'react';
import styles from '../../pages/EditorPage/EditorPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faRotateLeft, faBroom } from '@fortawesome/free-solid-svg-icons';
import type { ToolType } from '../../shared/types/canvas';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onClear: () => void;
  onRestore: () => void;
}

const toolButtons = [
  { tool: 'rectangle', icon: faSquareRegular, title: 'Rectangle' },
  { tool: 'circle', icon: faCircleRegular, title: 'Circle' },
  { tool: 'line', icon: faSlash, title: 'Line', iconProps: { rotation: 270 as 270 } },
  { tool: 'select', icon: faArrowPointer, title: 'Select' },
  { tool: 'pencil', icon: faPencil, title: 'Pencil' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onClear, onRestore }) => (
  <div className={styles.toolbar}>
    {toolButtons.map(({ tool, icon, title, iconProps }) => (
      <button
        key={tool}
        className={activeTool === tool ? styles.active : ''}
        onClick={() => onToolChange(tool as ToolType)}
        title={title}
      >
        <FontAwesomeIcon icon={icon} {...(iconProps || {})} />
      </button>
    ))}
    <button className={styles['btn-restore']} onClick={onRestore} title="Restore">
      <FontAwesomeIcon icon={faRotateLeft} />
    </button>
    <button className={styles['btn-clear']} onClick={onClear} title="Clear">
      <FontAwesomeIcon icon={faBroom} />
    </button>
  </div>
);

export default memo(Toolbar); 