// Single source of truth for "forward" in VFX. Every CSS preset should
// read direction via the --dir custom property (calc(var(--dir) * Npx))
// instead of hardcoding a sign — that keeps one preset working for both
// player and enemy forever, with no per-animation direction logic.
export function getForwardSign(faction) {
  return faction === 'enemy' ? -1 : 1;
}
