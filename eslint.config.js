import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astroPlugin.configs.recommended,
  {
    ignores: ['dist/**', '.astro/**', '.vercel/**', 'design-reference/**'],
  },
  {
    // env.d.ts's triple-slash references are Astro's own standard TS setup —
    // not a lint violation to fix in that file.
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
);
