import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare as faSquareRegular, faCircle as faCircleRegular } from '@fortawesome/free-regular-svg-icons';
import { faSlash, faArrowPointer, faPencil, faBroom, faMoon, faLightbulb } from '@fortawesome/free-solid-svg-icons';
import cn from 'classnames';

import ColorPicker from 'widgets/ColorPicker';
import type { ToolType } from 'shared/types/canvas';

import styles from './style.module.scss';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onClearCanvas: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode: () => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  isConnected?: boolean;
  currentRoom?: string | null;
  clientsInRoom?: number;
  roomId?: string;
  onRoomChange?: (roomId: string) => void;
}

const toolButtons = [
  { tool: 'select', icon: faArrowPointer, title: 'Select' },
  { tool: 'rectangle', icon: faSquareRegular, title: 'Rectangle' },
  { tool: 'circle', icon: faCircleRegular, title: 'Circle' },
  { tool: 'line', icon: faSlash, title: 'Line' },
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
  isConnected,
  currentRoom,
  clientsInRoom,
  roomId,
  onRoomChange,
}) => (
      <div className={styles.toolbar}>
      <div className={styles.toolbarButtons}>
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
        <button
          onClick={onClearCanvas}
          title="Clear Canvas"
          className={cn(styles.clearButton, styles.toolbarButton)}
        >
          <FontAwesomeIcon icon={faBroom} />
        </button>
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={styles.toolbarButton}
        >
          <FontAwesomeIcon icon={isDarkMode ? faLightbulb : faMoon} />
        </button>
      </div>
      
      {/* WebSocket статус */}
      <div className={styles.websocketStatus}>
        <div className={cn(styles.connectionIndicator, {
          [styles.connected]: isConnected,
          [styles.disconnected]: !isConnected,
        })}>
          <div className={styles.connectionDot} />
          {isConnected ? 'Подключено' : 'Отключено'}
        </div>
        {currentRoom && (
          <div className={styles.roomInfo}>
            Комната: {currentRoom} ({clientsInRoom} клиентов)
          </div>
        )}
        {roomId && onRoomChange && (
          <input
            type="text"
            value={roomId}
            onChange={(e) => onRoomChange(e.target.value)}
            placeholder="Название комнаты"
            className={styles.roomInput}
          />
        )}
      </div>
      
      <div className={styles.colorPickerWrapper}>
        <ColorPicker selectedColor={selectedColor} onColorChange={onColorChange} />
      </div>
    </div>
);

export default memo(Toolbar); 
