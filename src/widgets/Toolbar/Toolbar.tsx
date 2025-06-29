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

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onClear, onRestore }) => (
  <div className={styles.toolbar}>
    <button className={activeTool === 'rectangle' ? styles.active : ''} onClick={() => onToolChange('rectangle')} title="Прямоугольник">
      <FontAwesomeIcon icon={faSquareRegular} />
    </button>
    <button className={activeTool === 'circle' ? styles.active : ''} onClick={() => onToolChange('circle')} title="Круг">
      <FontAwesomeIcon icon={faCircleRegular} />
    </button>
    <button className={activeTool === 'line' ? styles.active : ''} onClick={() => onToolChange('line')} title="Линия">
      <FontAwesomeIcon icon={faSlash} rotation={270} />
    </button>
    <button className={activeTool === 'select' ? styles.active : ''} onClick={() => onToolChange('select')} title="Выделение">
      <FontAwesomeIcon icon={faArrowPointer} />
    </button>
    <button className={activeTool === 'pencil' ? styles.active : ''} onClick={() => onToolChange('pencil')} title="Карандаш">
      <FontAwesomeIcon icon={faPencil} />
    </button>
    <button className={styles['btn-restore']} onClick={onRestore} title="Восстановить">
      <FontAwesomeIcon icon={faRotateLeft} />
    </button>
    <button className={styles['btn-clear']} onClick={onClear} title="Очистить">
      <FontAwesomeIcon icon={faBroom} />
    </button>
  </div>
);

export default Toolbar; 