export function waitUntilScrollEnd(): Promise<void> {
  return new Promise((resolve) => {
    addEventListener('scrollend', () => resolve());
  });
}
