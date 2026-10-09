import Svg, { Circle, ClipPath, Defs, Path, Polygon, Rect } from 'react-native-svg';

/** Azerbaijani flag in a circle: blue, red, green bands with the white crescent and eight-pointed star. */
export function AzFlag({ size = 24 }: { size?: number }) {
  const r = size / 2;
  // crescent: a white disc with a red disc offset to the right cut out of it; star to its right
  const cx = size * 0.42;
  const cy = r;
  const cr = size * 0.17;
  const star = starPoints(size * 0.62, cy, size * 0.095, size * 0.045);
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <ClipPath id="round">
          <Circle cx={r} cy={r} r={r} />
        </ClipPath>
      </Defs>
      <Rect x={0} y={0} width={size} height={size / 3} fill="#00B5E2" clipPath="url(#round)" />
      <Rect x={0} y={size / 3} width={size} height={size / 3} fill="#EF3340" clipPath="url(#round)" />
      <Rect x={0} y={(size * 2) / 3} width={size} height={size / 3} fill="#509E2F" clipPath="url(#round)" />
      <Circle cx={cx} cy={cy} r={cr} fill="#FFFFFF" />
      <Circle cx={cx + cr * 0.32} cy={cy} r={cr * 0.84} fill="#EF3340" />
      <Polygon points={star} fill="#FFFFFF" />
    </Svg>
  );
}

/** Eight-pointed star as alternating outer/inner vertices. */
function starPoints(cx: number, cy: number, outer: number, inner: number) {
  const pts: string[] = [];
  for (let i = 0; i < 16; i += 1) {
    const rad = (Math.PI / 8) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? outer : inner;
    pts.push(`${(cx + rr * Math.cos(rad)).toFixed(2)},${(cy + rr * Math.sin(rad)).toFixed(2)}`);
  }
  return pts.join(' ');
}

/** Russian flag in a circle. */
export function RuFlag({ size = 24 }: { size?: number }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <ClipPath id="roundRu">
          <Circle cx={r} cy={r} r={r} />
        </ClipPath>
      </Defs>
      <Rect x={0} y={0} width={size} height={size / 3} fill="#FFFFFF" clipPath="url(#roundRu)" />
      <Rect x={0} y={size / 3} width={size} height={size / 3} fill="#0039A6" clipPath="url(#roundRu)" />
      <Rect x={0} y={(size * 2) / 3} width={size} height={size / 3} fill="#D52B1E" clipPath="url(#roundRu)" />
    </Svg>
  );
}

/** Union Jack in a circle. */
export function UkFlag({ size = 24 }: { size?: number }) {
  const r = size / 2;
  const s = size;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <ClipPath id="roundUk">
          <Circle cx={r} cy={r} r={r} />
        </ClipPath>
      </Defs>
      <Rect x={0} y={0} width={s} height={s} fill="#012169" clipPath="url(#roundUk)" />
      <Path d={`M0 0 L${s} ${s} M${s} 0 L0 ${s}`} stroke="#FFFFFF" strokeWidth={s * 0.2} clipPath="url(#roundUk)" />
      <Path d={`M0 0 L${s} ${s} M${s} 0 L0 ${s}`} stroke="#C8102E" strokeWidth={s * 0.07} clipPath="url(#roundUk)" />
      <Path d={`M${r} 0 V${s} M0 ${r} H${s}`} stroke="#FFFFFF" strokeWidth={s * 0.3} clipPath="url(#roundUk)" />
      <Path d={`M${r} 0 V${s} M0 ${r} H${s}`} stroke="#C8102E" strokeWidth={s * 0.17} clipPath="url(#roundUk)" />
    </Svg>
  );
}
