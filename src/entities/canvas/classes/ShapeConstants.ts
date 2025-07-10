export class ShapeConstants {
  // Selection styling constants
  static readonly SELECTION_BORDER_COLOR = '#228be6'; // saturated blue
  static readonly SELECTION_FILL_COLOR = 'rgba(34, 139, 230, 0.08)'; // semi-transparent blue
  static readonly SELECTION_LINE_WIDTH = 2;

  // Handle constants
  static readonly HANDLE_SIZE = 8;
  static readonly ROTATION_HANDLE_SIZE = 8;
  static readonly HANDLE_TOLERANCE = 10;
  static readonly ROTATION_HANDLE_OFFSET = 30;

  // Drawing constants
  static readonly ROUGHNESS = 1.5;
  static readonly BOWING = 2;
  static readonly MIN_SIZE = 20;

  // Hit testing tolerances
  static readonly LINE_HIT_TOLERANCE = 8; // squared distance for line hit testing
  static readonly POINT_HIT_TOLERANCE = 64; // squared distance for point hit testing

  // Default values
  static readonly DEFAULT_COLOR = 'red';
  static readonly DEFAULT_STROKE_WIDTH = 1;
  static readonly DEFAULT_SIZE = 1;
}
