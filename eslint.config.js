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
    // eslint-plugin-astro auto-detects @typescript-eslint/parser for frontmatter
    // parsing, but that's fragile across package managers — set it explicitly.
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
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
