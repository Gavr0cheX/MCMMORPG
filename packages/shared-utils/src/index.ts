export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function percentage(current: number, max: number) {
  if (max <= 0) {
    return 0;
  }

  return clamp((current / max) * 100, 0, 100);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
