// Verifica que los pares texto/fondo de la paleta cumplan WCAG 2.1 AA.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const rootBlock = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? '';
const tokens = Object.fromEntries(
  [...rootBlock.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()])
);

function color(nameOrHex: string): string {
  return nameOrHex.startsWith('#') ? nameOrHex : tokens[nameOrHex];
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe('paleta Balance', () => {
  it('define los tokens principales en hexadecimal', () => {
    for (const name of ['background', 'foreground', 'primary', 'sidebar', 'destructive']) {
      expect(tokens[name], name).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it.each([
    ['foreground', 'background', 4.5],
    ['muted-foreground', 'background', 4.5],
    ['muted-foreground', 'card', 4.5],
    ['primary-foreground', 'primary', 4.5],
    ['secondary-foreground', 'secondary', 4.5],
    ['destructive', '#F7DFD3', 4.5],
    ['sidebar-foreground', 'sidebar', 4.5],
    // Ítem activo del sidebar: texto de 14 px en negrita (texto grande para WCAG).
    ['sidebar-primary-foreground', 'sidebar-primary', 3],
  ])('%s sobre %s cumple contraste ≥ %s', (text, background, min) => {
    expect(ratio(color(text), color(background))).toBeGreaterThanOrEqual(min);
  });
});
