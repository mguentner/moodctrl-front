declare module '@jaames/iro' {
    interface IColorPickerOptions {
      width?: number;
      height?: number;
      color?: string;
      padding?: number;
      sliderMargin?: number;
      sliderHeight?: number;
      wheelLightness?: boolean;
      markerRadius?: number;
      borderWidth?: number;
      borderColor?: string;
      display?: string;
      anticlockwise?: boolean;
      css?: object;
      id?: string;
    }

    export type RGBColor = {
      r: number,
      g: number,
      b: number
    }

    export interface RGBAColor extends RGBColor {
      a: number
    }

    export class Color {
      hexString: string;
      rgb: RGBColor;
      rgba: RGBAColor;
    }

    export class ColorPicker {
      constructor(el?: string, options?: IColorPickerOptions);
      on(eventType: string, callback: (color: Color) => void): void;
      color: Color;
      id: string;
    }
  }