import { Platform, type TextStyle } from 'react-native';

/**
 * Browsers draw their own focus ring on text inputs (`outline-style: auto` ignores a zero width);
 * the app paints its own focus state, so the ring is switched off on the web only.
 */
export const noOutline: TextStyle = Platform.select({
  web: { outlineWidth: 0, outlineStyle: 'none' } as unknown as TextStyle,
  default: {},
}) as TextStyle;
