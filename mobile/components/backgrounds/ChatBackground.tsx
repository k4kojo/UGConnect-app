import React, { useMemo } from "react";
import { View, StyleSheet, ColorValue, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type Props = {
  mode?: "light" | "dark";
  density?: "sparse" | "normal" | "dense"; // how many bubbles to render
  showCircles?: boolean; // whether to show subtle circular backgrounds behind icons
  coverage?: number; // 0..1, approximate fraction of screen area to cover with bubbles (by circle area)
  variant?: "bubbles" | "doodles"; // visual style
};

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type BubbleDef = {
  key: string;
  pos: { top?: number; bottom?: number; left?: number; right?: number };
  size: number; // diameter of bubble container
  icon: IoniconName;
  iconSize: number;
  angle?: number;
};

const ICONS: IoniconName[] = [
  "medkit-outline",
  "bandage-outline",
  "heart-outline",
  "flask-outline",
  "thermometer-outline",
  "pulse-outline",
];

// A slightly larger set for the doodle pattern (safe, common Ionicons names)
const DOODLE_ICONS: IoniconName[] = [
  "heart-outline",
  "star-outline",
  "cloud-outline",
  "planet-outline",
  "umbrella-outline",
  "musical-notes-outline",
  "game-controller-outline",
  "leaf-outline",
  "medkit-outline",
  "bandage-outline",
  "flask-outline",
  "pulse-outline",
  "thermometer-outline",
];

function sizeRangeForDensity(density: "sparse" | "normal" | "dense"): [number, number] {
  switch (density) {
    case "sparse":
      return [56, 88];
    case "dense":
      return [28, 56];
    default:
      return [40, 68];
  }
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi));
}

function genRandomBubbles(
  width: number,
  height: number,
  density: "sparse" | "normal" | "dense",
  coverage: number
): BubbleDef[] {
  const [minSize, maxSize] = sizeRangeForDensity(density);
  const margin = 12; // keep a small margin from edges
  const gap = 4; // minimum gap between bubbles
  const clampedCoverage = Math.max(0, Math.min(coverage, 1));
  const targetArea = clampedCoverage * width * height;

  const bubbles: BubbleDef[] = [];
  let filledArea = 0;
  let attempts = 0;
  const maxAttempts = 5000; // allow more tries for high coverage without overlaps

  while (filledArea < targetArea && attempts < maxAttempts) {
    attempts++;
    const size = rand(minSize, maxSize);
    const radius = size / 2;
    const iconSize = Math.max(18, Math.min(32, Math.round(size * 0.45)));
    const topMax = Math.max(margin, height - size - margin);
    const leftMax = Math.max(margin, width - size - margin);
    const top = rand(margin, topMax);
    const left = rand(margin, leftMax);
    const icon = ICONS[Math.floor(rand(0, ICONS.length))] as IoniconName;

    // Reject if overlaps with any existing bubble (circle-circle test with small gap)
    const cx = left + radius;
    const cy = top + radius;
    let overlaps = false;
    for (let i = 0; i < bubbles.length; i++) {
      const bi = bubbles[i];
      const r2 = bi.size / 2;
      const cxi = (bi.pos.left ?? 0) + r2;
      const cyi = (bi.pos.top ?? 0) + r2;
      const minDist = radius + r2 + gap;
      const dx = cx - cxi;
      const dy = cy - cyi;
      if (dx * dx + dy * dy < minDist * minDist) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    bubbles.push({
      key: `rb_${bubbles.length}`,
      pos: { top, left },
      size,
      icon,
      iconSize,
    });

    filledArea += Math.PI * radius * radius; // approximate visible circular area
  }

  return bubbles;
}

// Helper: color interpolation for doodle strokes
function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return { r, g, b };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpColor(startHex: string, endHex: string, t: number, alpha = 0.6) {
  const s = hexToRgb(startHex);
  const e = hexToRgb(endHex);
  const r = Math.round(lerp(s.r, e.r, t));
  const g = Math.round(lerp(s.g, e.g, t));
  const b = Math.round(lerp(s.b, e.b, t));
  return `rgba(${r},${g},${b},${alpha})`;
}

function genDoodleGrid(
  width: number,
  height: number,
  density: "sparse" | "normal" | "dense"
): BubbleDef[] {
  const margin = 12;
  let spacing = 74;
  let sizeMin = 16;
  let sizeMax = 26;
  switch (density) {
    case "dense":
      spacing = 60;
      sizeMin = 14;
      sizeMax = 22;
      break;
    case "sparse":
      spacing = 88;
      sizeMin = 18;
      sizeMax = 28;
      break;
  }
  const jitter = spacing * 0.35;

  const cols = Math.max(1, Math.ceil(width / spacing));
  const rows = Math.max(1, Math.ceil(height / spacing));
  const list: BubbleDef[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const centerX = c * spacing + spacing / 2;
      const centerY = r * spacing + spacing / 2;
      const left = clamp(centerX + rand(-jitter, jitter), margin, width - margin);
      const top = clamp(centerY + rand(-jitter, jitter), margin, height - margin);
      const iconSize = Math.round(rand(sizeMin, sizeMax));
      const size = iconSize; // container size ~= icon size
      const icon = DOODLE_ICONS[Math.floor(rand(0, DOODLE_ICONS.length))] as IoniconName;
      const angle = rand(-15, 15);
      list.push({ key: `dg_${r}_${c}`, pos: { top, left }, size, icon, iconSize, angle });
    }
  }
  return list;
}

const ChatBackground: React.FC<Props> = ({ mode = "light", density = "normal", showCircles = true, coverage = 0.8, variant = "doodles" }) => {
  const isDark = mode === "dark";
  const { width, height } = useWindowDimensions();

  const gradientColors: [ColorValue, ColorValue] = isDark
    ? ["#0B1220", Colors.dark.background]
    : ["#E0F2FE", Colors.light.background];

  // Theme-tuned bubble fills (used only when showCircles=true)
  const bubbleBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(37,99,235,0.08)"; // brand.primary tint
  const bubbleBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(37,99,235,0.12)";
  const iconColor = isDark ? "rgba(147,197,253,0.7)" : "rgba(29,78,216,0.65)"; // sky-300 / brand.accent-ish
  const bubbles = useMemo(() => genRandomBubbles(width, height, density, coverage), [width, height, density, coverage]);
  const doodles = useMemo(() => genDoodleGrid(width, height, density), [width, height, density]);

  // Stroke gradient for doodles (diagonal bottom-left -> top-right)
  const strokeStart = isDark ? "#A855F7" : "#6366F1"; // violet-500 / indigo-500
  const strokeEnd = isDark ? "#60A5FA" : "#3B82F6"; // blue-400 / blue-500
  const colorAt = (x: number, y: number) => {
    const t = clamp((x + y) / (width + height), 0, 1);
    return lerpColor(strokeStart, strokeEnd, t, isDark ? 0.55 : 0.45);
  };

  return (
    <>
      <LinearGradient pointerEvents="none" colors={gradientColors} style={StyleSheet.absoluteFillObject} />
      {variant === "doodles"
        ? doodles.map((d) => (
            <View
              key={d.key}
              pointerEvents="none"
              style={[
                styles.bubble,
                { width: d.size, height: d.size, ...d.pos, transform: [{ rotate: `${d.angle ?? 0}deg` }] },
              ]}
            >
              <Ionicons
                name={d.icon}
                size={d.iconSize}
                color={colorAt((d.pos.left ?? 0) + d.size / 2, (d.pos.top ?? 0) + d.size / 2)}
              />
            </View>
          ))
        : bubbles.map((b) => (
            <View
              key={b.key}
              pointerEvents="none"
              style={[
                styles.bubble,
                { width: b.size, height: b.size, ...b.pos },
                showCircles
                  ? { backgroundColor: bubbleBg, borderColor: bubbleBorder, borderWidth: StyleSheet.hairlineWidth }
                  : null,
              ]}
            >
              <Ionicons name={b.icon} size={b.iconSize} color={iconColor} />
            </View>
          ))}
    </>
  );
}
;

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChatBackground;
