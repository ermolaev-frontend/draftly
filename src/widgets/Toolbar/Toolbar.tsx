import React from 'react';
import styles from '../../pages/EditorPage/EditorPage.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faRotateLeft, faBroom } from '@fortawesome/free-solid-svg-icons';

interface ToolbarProps {
  activeTool: string;
  onToolChange: (tool: string) => void;
  onClear: () => void;
  onRestore: () => void;
}

const toolButtons = [
  { tool: 'rectangle', icon: faSquareRegular, title: 'Прямоугольник' },
  { tool: 'circle', icon: faCircleRegular, title: 'Круг' },
  { tool: 'line', icon: faSlash, title: 'Линия', iconProps: { rotation: 270 as 270 } },
  { tool: 'select', icon: faArrowPointer, title: 'Выделение' },
  { tool: 'pencil', icon: faPencil, title: 'Карандаш' },
];

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onClear, onRestore }) => (
  <div className={styles.toolbar}>
    {toolButtons.map(({ tool, icon, title, iconProps }) => (
      <button
        key={tool}
        className={activeTool === tool ? styles.active : ''}
        onClick={() => onToolChange(tool)}
        title={title}
      >
        <FontAwesomeIcon icon={icon} {...(iconProps || {})} />
      </button>
    ))}
    <button className={styles['btn-restore']} onClick={onRestore} title="Восстановить">
      <FontAwesomeIcon icon={faRotateLeft} />
    </button>
    <button className={styles['btn-clear']} onClick={onClear} title="Очистить">
      <FontAwesomeIcon icon={faBroom} />
    </button>
  </div>
);

export default Toolbar; 