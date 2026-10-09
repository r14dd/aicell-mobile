import { useEffect, useRef, type RefObject } from 'react';
import type { View } from 'react-native';

export type Rect = { x: number; y: number; width: number; height: number };
export type TargetHandlers = { press?: () => void; setValue?: (value: string) => void };
type Target = { measure: () => Promise<Rect | null>; handlers: () => TargetHandlers };

const targets = new Map<string, Target>();

export function registerTarget(id: string, target: Target) {
  targets.set(id, target);
  return () => {
    if (targets.get(id) === target) targets.delete(id);
  };
}

/** Polls for a target while a screen is still mounting. */
export async function waitForTarget(id: string, timeoutMs = 5000) {
  const until = Date.now() + timeoutMs;
  while (Date.now() < until) {
    const target = targets.get(id);
    if (target) return target;
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

/** Registers a view as something Laya can point at and press or fill. */
export function useLayaTarget(id: string, ref: RefObject<View | null>, handlers: TargetHandlers) {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });
  useEffect(
    () =>
      registerTarget(id, {
        measure: () =>
          new Promise((resolve) => {
            const node = ref.current;
            if (!node) return resolve(null);
            node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
          }),
        handlers: () => latest.current,
      }),
    [id, ref],
  );
}
