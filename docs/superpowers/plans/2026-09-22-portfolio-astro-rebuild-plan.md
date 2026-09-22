# Portfolio André Freitas — Rebuild em Astro — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir o protótipo `Portfolio.dc.html` / `Identidade Visual.dc.html` como um site Astro de produção — mesma identidade visual, mesmas 9 animações, PT/EN via rotas reais, projetos como content collection (1 arquivo MDX = 1 projeto).

**Architecture:** Astro 5 `output: 'static'` com React 19 só nas 3 ilhas com estado (intro, canvas ambiente, cursor customizado); todo o resto — reveal, magnetic, parallax, marquee, progress bar — é TypeScript vanilla ou CSS puro, religado em cada troca de idioma via `astro:page-load` (View Transitions). Conteúdo versionado em Git: `src/content/projects/*.mdx` para projetos, `src/data/*.ts` para listas fixas, `src/locales/ui.ts` para strings de interface.

**Tech Stack:** Astro 5.x, React 19, TypeScript 5.x (`strict: true`), Tailwind CSS v4 (CSS-first, `@theme`), MDX + Zod (Content Collections), Vitest, ESLint + Prettier, pnpm, `@astrojs/vercel`.

**Spec:** `docs/superpowers/specs/2026-09-21-portfolio-astro-rebuild-design.md`

## Global Constraints

- Astro `output: 'static'`, adapter `@astrojs/vercel`. Nenhuma função serverless.
- React 19 só em `IntroSplash`, `AmbientCanvas`, `CustomCursor` (únicos com estado interno). Todo o resto é `.astro` ou TypeScript vanilla — o bundle de JS de framework deve ficar mínimo.
- TypeScript `strict: true` em todo o projeto.
- Tailwind v4 CSS-first: tokens via `@theme` em `src/styles/global.css`. **Não criar `tailwind.config.ts`.**
- Cores literais (não reinterpretar): `ink #0E0D0C`, `graphite #1B1917`, `graphite-2 #201E1B`, `volt #D3F24E`, `ember #FF9C7B`, `paper #F2EFE9`, `border #221F1C`, `border-strong #2A2724`, `border-hover #3A3733`, `muted-label #8C877E`, `muted-soft #9A958C`, `muted-body #B9B4AA`, `muted-bright #E4E0D8`.
- Tipografia: `Archivo Black` (display), `Archivo` 400/500/600/700 (corpo), `JetBrains Mono` 400/500 (label/dado). Self-hosted, sem round-trip a `fonts.googleapis.com`.
- Cópia PT/EN é a do protótipo (`Portfolio.dc.html` linhas 220–284), usada **verbatim** — não reescrever.
- Parâmetros de animação de `spec §5.1` são exatos, não aproximados: offsets de reveal, stagger `i*0.09+0.06`, `parallaxOffset = (top+height/2-vh/2)*-speed`, `magneticOffset = (cursor-centro)*0.18`, canvas com 216 partículas/raio 0.5–2.6px/22% quentes/grid 130px/repulsão raio 190px força 46px/dpr≤2, cursor dot 7px + ring 32px + lerp 0.16.
- `i18n`: `defaultLocale: 'pt'`, `locales: ['pt','en']`, `routing.prefixDefaultLocale: false` → `/` = PT, `/en/` = EN.
- Scripts vanilla DOM (`reveal`, `magnetic`, `parallax`) devem re-bindar em `astro:page-load`, não só `DOMContentLoaded` — senão param de funcionar após a primeira troca de idioma.
- `prefers-reduced-motion: reduce` pausa canvas, cursor, marquee e parallax, e troca o reveal por fade simples sem deslocamento (`transform: none`). `:focus-visible` com outline `volt` em todo elemento interativo — nenhum dos dois existia no protótipo.
- Content collection `projects`: 1 arquivo `.mdx` por projeto (campos `{pt,en}` no mesmo arquivo, não 1 arquivo por idioma). Número do card (`01`, `02`…) **derivado da posição**, nunca hardcoded.
- Testes automatizados (Vitest) cobrem só `motion/` (funções puras) e o schema Zod de `projects` — não há teste de componente `.astro`/React nesta v1; a verificação desses é build + `pnpm dev` manual.
- `design-reference/` arquiva `Portfolio.dc.html`, `Identidade Visual.dc.html` e `assets/andre.jpeg` — não é buildado. `support.js`, `.thumbnail` e `uploads/` são descartados (ver Task 1, decisão sobre `uploads/`).
- Light mode, página de detalhe de projeto, collection `notes`, CMS e formulário de contato **ficam fora do escopo** — não implementar.

---

## Achado prévio a esta spec: `uploads/`

Antes de escrever este plano, inspecionei os dois arquivos em `uploads/` (pendência deixada em aberto na spec, §14):
- `uploads/pasted-1789695132913-0.png` — é um screenshot da própria seção de stack marquee do protótipo (UI, não conteúdo de projeto).
- `uploads/foto-1789685791424-w423.jpeg` — é pixel-a-pixel a mesma foto já presente em `assets/andre.jpeg`.

Conclusão: nada em `uploads/` é aproveitável. A pasta inteira é descartada no Task 1, sem perda.

## Desvio de implementação: fontes self-hosted via Fontsource

A spec (§4.2) diz "self-host em `public/fonts/`". Este plano usa os pacotes **Fontsource** (`@fontsource/archivo-black`, `@fontsource/archivo`, `@fontsource/jetbrains-mono`) em vez de arquivos `.woff2` manuais em `public/fonts/`: mesmas famílias/pesos, mesmo resultado (self-hosted, sem round-trip externo), mas versionado via `package.json` em vez de binários soltos no repo — não há como este plano produzir arquivos de fonte binários corretos à mão. O objetivo da decisão original (§2 da spec) é preservado; só o mecanismo muda.

## Ativos que precisam ser fornecidos manualmente (fora deste plano)

- `public/og-image.jpg` — não existe ainda; a tag `og:image` aponta para `/og-image.jpg` mas o build não falha sem o arquivo. Adicionar depois.
- `public/curriculo.pdf` — o protótipo referencia `curriculo.pdf` como link direto; o PDF real precisa ser copiado para `public/` pelo usuário antes do deploy.

---

## File Structure

```
personal-portfolio/
├── design-reference/
│   ├── Portfolio.dc.html
│   ├── Identidade Visual.dc.html
│   └── assets/andre.jpeg
├── public/
│   ├── favicon.svg
│   ├── og-image.jpg            # fornecido manualmente (ver acima)
│   └── curriculo.pdf           # fornecido manualmente (ver acima)
├── src/
│   ├── assets/
│   │   └── andre.jpg
│   ├── content/
│   │   ├── config.ts
│   │   ├── projectSchema.ts
│   │   ├── projectSchema.test.ts
│   │   └── projects/
│   │       ├── savemoney.mdx
│   │       └── guysmovies.mdx
│   ├── locales/
│   │   ├── locales.ts
│   │   ├── ui.ts
│   │   ├── utils.ts
│   │   └── utils.test.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── AmbientCanvas.tsx
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── ScrollProgress.astro
│   │   │   ├── Header.astro
│   │   │   └── LangSwitch.astro
│   │   ├── motion/
│   │   │   ├── reveal.ts
│   │   │   ├── reveal.test.ts
│   │   │   ├── magnetic.ts
│   │   │   ├── magnetic.test.ts
│   │   │   ├── parallax.ts
│   │   │   ├── parallax.test.ts
│   │   │   ├── bootstrap.ts
│   │   │   └── Marquee.astro
│   │   ├── sections/
│   │   │   ├── IntroSplash.tsx
│   │   │   ├── Hero.astro
│   │   │   ├── About.astro
│   │   │   ├── Experience.astro
│   │   │   ├── Projects.astro
│   │   │   ├── ProjectCard.astro
│   │   │   ├── StackMarquee.astro
│   │   │   └── Contact.astro
│   │   └── ui/
│   │       ├── SectionLabel.astro
│   │       ├── SocialIcon.astro
│   │       └── Tag.astro
│   ├── data/
│   │   ├── experience.ts
│   │   ├── stack.ts
│   │   └── social.ts
│   ├── styles/
│   │   └── global.css
│   ├── lib/
│   │   ├── types.ts
│   │   ├── intro.ts
│   │   ├── intro.test.ts
│   │   ├── motion-prefs.ts
│   │   └── motion-prefs.test.ts
│   ├── env.d.ts
│   └── pages/
│       ├── index.astro
│       └── en/
│           └── index.astro
├── astro.config.ts
├── tsconfig.json
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
└── package.json
```

---

### Task 1: Limpeza do repositório + scaffold do projeto Astro

**Files:**
- Create: `design-reference/Portfolio.dc.html`, `design-reference/Identidade Visual.dc.html`, `design-reference/assets/andre.jpeg` (movidos)
- Delete: `support.js`, `.thumbnail`, `uploads/`, `assets/` (raiz, após mover `andre.jpeg`), `Portfolio.dc.html` e `Identidade Visual.dc.html` na raiz (movidos, não copiados)
- Create: `package.json`, `astro.config.ts`, `tsconfig.json`, `vitest.config.ts`, `eslint.config.js`, `.prettierrc`, `.gitignore`, `src/env.d.ts`, `src/pages/index.astro` (placeholder), `public/favicon.svg`

**Interfaces:**
- Produces: comandos `pnpm dev` / `pnpm build` / `pnpm test` / `pnpm lint` funcionais; `astro.config.ts` com `i18n` configurado (consumido pelo Task 8 em diante).

- [ ] **Step 1: Arquivar o material de referência e descartar o que não serve**

```bash
mkdir -p "design-reference/assets"
mv "Portfolio.dc.html" "design-reference/Portfolio.dc.html"
mv "Identidade Visual.dc.html" "design-reference/Identidade Visual.dc.html"
mv "assets/andre.jpeg" "design-reference/assets/andre.jpeg"
rmdir assets
rm -rf support.js .thumbnail uploads
```

- [ ] **Step 2: Criar `package.json`**

```json
{
  "name": "personal-portfolio",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/vercel": "^8.0.0",
    "@fontsource/archivo": "^5.0.0",
    "@fontsource/archivo-black": "^5.0.0",
    "@fontsource/jetbrains-mono": "^5.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.5.0",
    "vitest": "^2.1.0",
    "jsdom": "^25.0.0",
    "eslint": "^9.9.0",
    "@eslint/js": "^9.9.0",
    "eslint-plugin-astro": "^1.2.0",
    "typescript-eslint": "^8.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-astro": "^0.14.0"
  }
}
```

- [ ] **Step 3: Criar `astro.config.ts`**

```ts
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [react(), mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 4: Criar `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "strict": true
  }
}
```

- [ ] **Step 5: Criar `src/env.d.ts`**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 6: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 7: Criar `eslint.config.js`**

```js
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
```

- [ ] **Step 8: Criar `.prettierrc`**

```json
{
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

- [ ] **Step 9: Criar `.gitignore`**

```
node_modules/
dist/
.astro/
.vercel/
.env
.DS_Store
```

- [ ] **Step 10: Criar favicon e página placeholder**

`public/favicon.svg` (monograma AF, mesmas cores da marca):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 34">
  <rect width="34" height="34" fill="#D3F24E"/>
  <text x="17" y="23" text-anchor="middle" font-family="Archivo Black, Helvetica, sans-serif" font-size="17" letter-spacing="-1" fill="#0E0D0C">AF</text>
</svg>
```

`src/pages/index.astro` (placeholder temporário, substituído no Task 8):

```astro
---
---
<html lang="pt">
  <body>
    <p>Scaffold OK</p>
  </body>
</html>
```

- [ ] **Step 11: Instalar dependências e verificar o build**

```bash
pnpm install
pnpm build
```

Esperado: build conclui sem erro, gera `dist/`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro project, archive prototype in design-reference/"
```

---

### Task 2: Design tokens, fontes e CSS global

**Files:**
- Create: `src/styles/global.css`

**Interfaces:**
- Produces: classes utilitárias Tailwind `bg-ink`, `text-volt`, `border-border-strong`, `font-display`, `font-mono`, `font-body`, etc. (consumidas por todos os componentes a partir do Task 8); classe `.photo-duotone` (consumida por `About.astro`, Task 11); keyframes `afTile`, `afLeft`, `afRight`, `afRule`, `afWipe`, `afFadeUp`, `afMarquee`, `afMarqueeRev` (consumidos por `IntroSplash.tsx` e `Marquee.astro`).

- [ ] **Step 1: Escrever `src/styles/global.css`**

```css
@import 'tailwindcss';
@import '@fontsource/archivo-black';
@import '@fontsource/archivo/400.css';
@import '@fontsource/archivo/500.css';
@import '@fontsource/archivo/600.css';
@import '@fontsource/archivo/700.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';

@theme {
  --color-ink: #0e0d0c;
  --color-graphite: #1b1917;
  --color-graphite-2: #201e1b;
  --color-volt: #d3f24e;
  --color-ember: #ff9c7b;
  --color-paper: #f2efe9;
  --color-border: #221f1c;
  --color-border-strong: #2a2724;
  --color-border-hover: #3a3733;
  --color-muted-label: #8c877e;
  --color-muted-soft: #9a958c;
  --color-muted-body: #b9b4aa;
  --color-muted-bright: #e4e0d8;

  --font-display: 'Archivo Black', Helvetica, sans-serif;
  --font-body: 'Archivo', Helvetica, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html {
  background: var(--color-ink);
  scroll-behavior: smooth;
}

body {
  background: var(--color-ink);
  color: var(--color-paper);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--color-volt);
}
a:hover {
  color: var(--color-ember);
}

:focus-visible {
  outline: 2px solid var(--color-volt);
  outline-offset: 2px;
}

[data-marquee]:hover {
  animation-play-state: paused;
}

@keyframes afTile {
  0% {
    transform: scale(0.55) rotate(-8deg);
    opacity: 0;
  }
  55%,
  100% {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}
@keyframes afLeft {
  0% {
    transform: translateX(-70%);
    opacity: 0;
  }
  40%,
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes afRight {
  0% {
    transform: translateX(70%);
    opacity: 0;
  }
  40%,
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}
@keyframes afRule {
  0%,
  30% {
    transform: scaleX(0);
  }
  70%,
  100% {
    transform: scaleX(1);
  }
}
@keyframes afWipe {
  0%,
  68% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-101%);
  }
}
@keyframes afFadeUp {
  0% {
    transform: translateY(18px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
@keyframes afMarquee {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(-50%, 0, 0);
  }
}
@keyframes afMarqueeRev {
  from {
    transform: translate3d(-50%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@media (max-width: 760px) {
  #afCursor,
  #afRing {
    display: none !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-marquee] {
    animation: none !important;
  }
}

.photo-duotone {
  position: relative;
}
.photo-duotone img {
  filter: grayscale(1) contrast(1.12) brightness(0.95);
}
.photo-duotone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-volt);
  mix-blend-mode: color;
  opacity: 0.82;
  pointer-events: none;
}
.photo-duotone::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-ink);
  mix-blend-mode: multiply;
  opacity: 0.18;
  pointer-events: none;
}
```

Note: `afFloat` existe no protótipo mas não é referenciado por nenhum elemento (código morto) — não portado, conforme já refletido na lista literal de `spec §4.3`.

- [ ] **Step 2: Verificar visualmente**

```bash
pnpm dev
```

Abrir `http://localhost:4321`, confirmar que a página placeholder carrega sem erro de CSS no console.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add design tokens, self-hosted fonts and keyframes"
```

---

### Task 3: Infraestrutura de locales (`locales.ts`, `ui.ts`, `utils.ts`)

**Files:**
- Create: `src/locales/locales.ts`, `src/locales/ui.ts`, `src/locales/utils.ts`
- Test: `src/locales/utils.test.ts`

**Interfaces:**
- Produces: `type Locale = 'pt' | 'en'`, `defaultLocale`, `locales`; `interface UiDictionary`, `ui: Record<Locale, UiDictionary>`; `useTranslations(locale: Locale): UiDictionary`, `getAlternateUrl(pathname: string, targetLocale: Locale): string`. Consumido por `Header.astro`, `LangSwitch.astro`, `BaseLayout.astro` e todas as seções (Task 8–11). (Nenhum componente detecta o idioma a partir da URL em runtime — cada página já sabe seu próprio `locale` como literal — por isso não há `getLocaleFromUrl` neste plano.)

- [ ] **Step 1: Criar `src/locales/locales.ts`**

```ts
export const locales = ['pt', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'pt';
```

- [ ] **Step 2: Criar `src/locales/ui.ts`** (cópia verbatim de `Portfolio.dc.html` linhas 220–284, restrita às strings de UI — `jobs`/`projects`/`stack`/`practices` migram para `data/`/`content/` nos Tasks 6–7; `nav4`/Notas fica fora, seção não existe em v1)

```ts
import type { Locale } from './locales';

export interface UiDictionary {
  langLabel: string;
  nav1: string;
  nav2: string;
  nav3: string;
  nav5: string;
  h1a: string;
  h1b: string;
  heroSub: string;
  ctaWork: string;
  ctaCv: string;
  visit: string;
  aboutTitle: string;
  about1: string;
  about2: string;
  expTitle: string;
  projTitle: string;
  noPreview: string;
  contactLabel: string;
  contactTitle: string;
  contactSub: string;
  footer: string;
}

export const ui: Record<Locale, UiDictionary> = {
  pt: {
    langLabel: 'EN',
    nav1: 'Sobre',
    nav2: 'Experiência',
    nav3: 'Projetos',
    nav5: 'Contato',
    h1a: 'ENGENHEIRO',
    h1b: 'DE SOFTWARE',
    heroSub:
      'Construo sistemas e interfaces de ponta a ponta — do banco ao pixel. Mão na massa, entrega constante, foco em produto.',
    ctaWork: 'Ver projetos',
    ctaCv: 'Currículo',
    visit: 'Acessar projeto',
    aboutTitle: 'Sobre',
    about1:
      'Sou desenvolvedor full-stack com foco em back-end e sistemas de comunicação. Hoje sou Software Engineer no KaBuM!, responsável pelos sistemas que falam com o cliente.',
    about2:
      'Gosto de problema real: fila, evento, integração, dashboard que alguém usa todo dia. Aprendo construindo — sempre tem algo rodando em paralelo.',
    expTitle: 'Experiência',
    projTitle: 'Projetos',
    noPreview: 'Preview em breve',
    contactLabel: 'Contato',
    contactTitle: 'VAMOS CONSTRUIR ALGO',
    contactSub: 'Aberto a oportunidades como engenheiro de software. Chama no LinkedIn ou dá uma olhada no currículo.',
    footer: 'Feito à mão',
  },
  en: {
    langLabel: 'PT',
    nav1: 'About',
    nav2: 'Experience',
    nav3: 'Work',
    nav5: 'Contact',
    h1a: 'SOFTWARE',
    h1b: 'ENGINEER',
    heroSub:
      'I build systems and interfaces end to end — from the database to the pixel. Hands-on, shipping constantly, product-focused.',
    ctaWork: 'See work',
    ctaCv: 'Resume',
    visit: 'Visit project',
    aboutTitle: 'About',
    about1:
      'Full-stack developer focused on back-end and customer communication systems. Currently a Software Engineer at KaBuM!, owning the systems that talk to the customer.',
    about2:
      'I like real problems: queues, events, integrations, dashboards someone opens every day. I learn by building — there is always something running on the side.',
    expTitle: 'Experience',
    projTitle: 'Work',
    noPreview: 'Preview coming soon',
    contactLabel: 'Contact',
    contactTitle: "LET'S BUILD SOMETHING",
    contactSub: 'Open to software engineering opportunities. Reach out on LinkedIn or take a look at my resume.',
    footer: 'Handmade',
  },
};
```

- [ ] **Step 3: Escrever o teste de `utils.ts` primeiro — `src/locales/utils.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { getAlternateUrl, useTranslations } from './utils';

describe('useTranslations', () => {
  it('returns the pt dictionary', () => {
    expect(useTranslations('pt').aboutTitle).toBe('Sobre');
  });

  it('returns the en dictionary', () => {
    expect(useTranslations('en').aboutTitle).toBe('About');
  });
});

describe('getAlternateUrl', () => {
  it('adds the /en prefix from the pt root', () => {
    expect(getAlternateUrl('/', 'en')).toBe('/en/');
  });

  it('strips the /en prefix back to pt', () => {
    expect(getAlternateUrl('/en/', 'pt')).toBe('/');
  });

  it('preserves subpaths in both directions', () => {
    expect(getAlternateUrl('/en/projetos', 'pt')).toBe('/projetos');
    expect(getAlternateUrl('/projetos', 'en')).toBe('/en/projetos');
  });
});
```

- [ ] **Step 4: Rodar o teste e confirmar que falha**

```bash
pnpm test src/locales/utils.test.ts
```

Esperado: FAIL — `Cannot find module './utils'` (arquivo ainda não existe).

- [ ] **Step 5: Implementar `src/locales/utils.ts`**

```ts
import { defaultLocale, type Locale } from './locales';
import { ui, type UiDictionary } from './ui';

export function useTranslations(locale: Locale): UiDictionary {
  return ui[locale];
}

export function getAlternateUrl(pathname: string, targetLocale: Locale): string {
  const withoutLocalePrefix = pathname.replace(/^\/en\/?/, '/');
  if (targetLocale === defaultLocale) return withoutLocalePrefix;
  return withoutLocalePrefix === '/' ? `/${targetLocale}/` : `/${targetLocale}${withoutLocalePrefix}`;
}
```

- [ ] **Step 6: Rodar o teste de novo e confirmar que passa**

```bash
pnpm test src/locales/utils.test.ts
```

Esperado: PASS, 5 testes.

- [ ] **Step 7: Commit**

```bash
git add src/locales/
git commit -m "feat: add locale dictionary and URL translation utilities"
```

---

### Task 4: Utilitários compartilhados — `intro.ts` e `motion-prefs.ts`

**Files:**
- Create: `src/lib/motion-prefs.ts`, `src/lib/intro.ts`
- Test: `src/lib/motion-prefs.test.ts`, `src/lib/intro.test.ts`

**Interfaces:**
- Produces: `prefersReducedMotion(): boolean` (consumido por `reveal.ts`, `parallax.ts`, `AmbientCanvas.tsx`, `CustomCursor.tsx` — Tasks 5 e 9); `INTRO_DURATION_MS`, `introAlreadySeen(): boolean`, `markIntroSeen(): void` (consumido por `IntroSplash.tsx` e `reveal.ts` — Tasks 5 e 9, para manter o delay do reveal sincronizado com a duração real da intro).

- [ ] **Step 1: Escrever o teste de `motion-prefs.ts` — `src/lib/motion-prefs.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prefersReducedMotion } from './motion-prefs';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('prefersReducedMotion', () => {
  it('returns true when the media query matches', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }) as MediaQueryList);
    expect(prefersReducedMotion()).toBe(true);
  });

  it('returns false when the media query does not match', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }) as MediaQueryList);
    expect(prefersReducedMotion()).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

```bash
pnpm test src/lib/motion-prefs.test.ts
```

Esperado: FAIL — módulo não existe.

- [ ] **Step 3: Implementar `src/lib/motion-prefs.ts`**

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

```bash
pnpm test src/lib/motion-prefs.test.ts
```

Esperado: PASS, 2 testes.

- [ ] **Step 5: Escrever o teste de `intro.ts` — `src/lib/intro.test.ts`**

```ts
import { afterEach, describe, expect, it } from 'vitest';
import { INTRO_DURATION_MS, introAlreadySeen, markIntroSeen } from './intro';

afterEach(() => {
  window.sessionStorage.clear();
});

describe('intro session flag', () => {
  it('exposes the intro duration used by the splash animation', () => {
    expect(INTRO_DURATION_MS).toBe(2400);
  });

  it('is not seen before markIntroSeen is called', () => {
    expect(introAlreadySeen()).toBe(false);
  });

  it('is seen after markIntroSeen is called', () => {
    markIntroSeen();
    expect(introAlreadySeen()).toBe(true);
  });
});
```

- [ ] **Step 6: Rodar e confirmar falha**

```bash
pnpm test src/lib/intro.test.ts
```

Esperado: FAIL — módulo não existe.

- [ ] **Step 7: Implementar `src/lib/intro.ts`**

```ts
const STORAGE_KEY = 'af-intro-seen';

export const INTRO_DURATION_MS = 2400;

export function introAlreadySeen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function markIntroSeen(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, '1');
}
```

- [ ] **Step 8: Rodar e confirmar sucesso**

```bash
pnpm test src/lib/intro.test.ts
```

Esperado: PASS, 3 testes.

- [ ] **Step 9: Commit**

```bash
git add src/lib/motion-prefs.ts src/lib/motion-prefs.test.ts src/lib/intro.ts src/lib/intro.test.ts
git commit -m "feat: add reduced-motion and intro-session shared utilities"
```

---

### Task 5: Utilitários de movimento — `reveal.ts`, `magnetic.ts`, `parallax.ts`, `bootstrap.ts`

**Files:**
- Create: `src/components/motion/reveal.ts`, `src/components/motion/magnetic.ts`, `src/components/motion/parallax.ts`, `src/components/motion/bootstrap.ts`
- Test: `src/components/motion/reveal.test.ts`, `src/components/motion/magnetic.test.ts`, `src/components/motion/parallax.test.ts`

**Interfaces:**
- Consumes: `prefersReducedMotion` de `[[Task 4]]` (`src/lib/motion-prefs.ts`), `INTRO_DURATION_MS`/`introAlreadySeen` de `src/lib/intro.ts`.
- Produces: `hiddenTransform(dir, index, reducedMotion?): string`, `resolveDirection(dir, index)`, `lineDelay(index): number`, `setupReveal(root?): () => void`; `magneticOffset(cursor, box, strength?): {dx,dy}`, `bindMagnetic(root?): () => void`; `parallaxOffset(top, height, vh, speed): number`, `bindParallax(root?): () => void`. `bootstrap.ts` religa os três em cada `astro:page-load` — importado 1x em `BaseLayout.astro` (Task 8). Todos os elementos DOM consumidos usam `data-reveal`, `data-anim`, `data-line`, `data-magnetic`, `data-parallax` — os mesmos atributos usados nas seções do Task 11.

- [ ] **Step 1: Escrever o teste de `reveal.ts` — `src/components/motion/reveal.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { hiddenTransform, lineDelay, resolveDirection } from './reveal';

describe('resolveDirection', () => {
  it('resolves "auto" to left on even indexes and right on odd', () => {
    expect(resolveDirection('auto', 0)).toBe('left');
    expect(resolveDirection('auto', 1)).toBe('right');
  });

  it('passes explicit directions through unchanged', () => {
    expect(resolveDirection('pop', 3)).toBe('pop');
  });
});

describe('hiddenTransform', () => {
  it('matches the exact prototype offsets per direction', () => {
    expect(hiddenTransform('left', 0)).toBe('translate3d(-70px,14px,0) rotate(-1.6deg)');
    expect(hiddenTransform('right', 0)).toBe('translate3d(70px,14px,0) rotate(1.6deg)');
    expect(hiddenTransform('down', 0)).toBe('translate3d(0,-44px,0)');
    expect(hiddenTransform('pop', 0)).toBe('translate3d(0,26px,0) scale(.72)');
    expect(hiddenTransform('up', 0)).toBe('translate3d(0,48px,0)');
  });

  it('resolves "auto" by index parity before computing the offset', () => {
    expect(hiddenTransform('auto', 0)).toBe(hiddenTransform('left', 0));
    expect(hiddenTransform('auto', 1)).toBe(hiddenTransform('right', 1));
  });

  it('collapses to "none" under reduced motion regardless of direction', () => {
    expect(hiddenTransform('left', 0, true)).toBe('none');
    expect(hiddenTransform('pop', 2, true)).toBe('none');
  });
});

describe('lineDelay', () => {
  it('matches the prototype stagger formula i*0.09+0.06', () => {
    expect(lineDelay(0)).toBeCloseTo(0.06);
    expect(lineDelay(1)).toBeCloseTo(0.15);
    expect(lineDelay(2)).toBeCloseTo(0.24);
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

```bash
pnpm test src/components/motion/reveal.test.ts
```

Esperado: FAIL — módulo não existe.

- [ ] **Step 3: Implementar `src/components/motion/reveal.ts`**

```ts
import { INTRO_DURATION_MS, introAlreadySeen } from '../../lib/intro';
import { prefersReducedMotion } from '../../lib/motion-prefs';

export type RevealDirection = 'left' | 'right' | 'down' | 'pop' | 'up' | 'auto';
type ResolvedDirection = Exclude<RevealDirection, 'auto'>;

export function resolveDirection(dir: RevealDirection, index: number): ResolvedDirection {
  if (dir !== 'auto') return dir;
  return index % 2 ? 'right' : 'left';
}

export function hiddenTransform(dir: RevealDirection, index: number, reducedMotion = false): string {
  if (reducedMotion) return 'none';
  switch (resolveDirection(dir, index)) {
    case 'left':
      return 'translate3d(-70px,14px,0) rotate(-1.6deg)';
    case 'right':
      return 'translate3d(70px,14px,0) rotate(1.6deg)';
    case 'down':
      return 'translate3d(0,-44px,0)';
    case 'pop':
      return 'translate3d(0,26px,0) scale(.72)';
    default:
      return 'translate3d(0,48px,0)';
  }
}

export function lineDelay(index: number): number {
  return index * 0.09 + 0.06;
}

const EASE = 'cubic-bezier(.2,1.25,.32,1)';
const FALLBACK_MS = 1500;

function showEl(el: HTMLElement): void {
  const reduced = prefersReducedMotion();
  el.style.transition = `opacity .7s cubic-bezier(.16,1,.3,1), transform .9s ${EASE}`;
  el.style.opacity = '1';
  el.style.transform = 'none';
  el.querySelectorAll<HTMLElement>('[data-line] > span').forEach((span, i) => {
    span.style.transition = `transform 1s ${EASE} ${lineDelay(i)}s`;
    span.style.transform = reduced ? 'none' : 'translateY(0) rotate(0deg)';
  });
  Array.from(el.querySelectorAll<HTMLElement>('[data-anim]')).forEach((unit, i) => {
    const delay = 0.16 + i * 0.075;
    unit.style.transition = `opacity .6s cubic-bezier(.16,1,.3,1) ${delay}s, transform .95s ${EASE} ${delay}s`;
    unit.style.opacity = '1';
    unit.style.transform = 'none';
  });
}

function hideEl(el: HTMLElement): void {
  const reduced = prefersReducedMotion();
  el.style.opacity = '0';
  el.style.transform = reduced ? 'none' : 'translate3d(0,34px,0)';
  el.querySelectorAll<HTMLElement>('[data-line] > span').forEach((span) => {
    span.style.transform = reduced ? 'none' : 'translateY(108%) rotate(3deg)';
  });
  Array.from(el.querySelectorAll<HTMLElement>('[data-anim]')).forEach((unit, i) => {
    unit.style.willChange = 'transform, opacity';
    unit.style.opacity = '0';
    const dir = (unit.getAttribute('data-anim') as RevealDirection) ?? 'up';
    unit.style.transform = hiddenTransform(dir, i, reduced);
  });
}

export function setupReveal(root: ParentNode = document): () => void {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!nodes.length || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => showEl(n));
    return () => {};
  }

  // heroDelay mantém o reveal sincronizado com a duração real da intro:
  // curta (80ms) quando a intro já rodou nesta sessão, cheia (dur-400) na primeira visita.
  const heroDelayMs = introAlreadySeen() ? 80 : Math.max(200, INTRO_DURATION_MS - 400);

  nodes.forEach((el) => hideEl(el));
  const pending = new Set(nodes);
  let decided = false;
  let canReveal = false;

  // Every window.setTimeout id scheduled in this function is tracked here so
  // the returned cleanup can clear all of them — a stale timeout firing after
  // an astro:page-load teardown would otherwise mutate torn-down DOM nodes.
  const pendingTimeouts = new Set<ReturnType<typeof window.setTimeout>>();
  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      pendingTimeouts.delete(id);
      fn();
    }, delay);
    pendingTimeouts.add(id);
    return id;
  };

  schedule(() => {
    canReveal = true;
  }, heroDelayMs);

  const revealIfPending = (el: HTMLElement) => {
    showEl(el);
    pending.delete(el);
  };

  const onScroll = () => {
    if (!canReveal || !pending.size) return;
    Array.from(pending).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.6) revealIfPending(el);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const showAllStaggered = () => nodes.forEach((n, i) => schedule(() => revealIfPending(n), i * 140));

  const io = new IntersectionObserver(
    (entries) => {
      if (!decided) {
        decided = true;
        const offscreen = entries.filter((e) => !e.isIntersecting);
        if (!offscreen.length) {
          io.disconnect();
          schedule(showAllStaggered, heroDelayMs);
          return;
        }
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const delay = e.target === nodes[0] ? heroDelayMs : 0;
          schedule(() => revealIfPending(e.target as HTMLElement), delay);
          io.unobserve(e.target);
        });
        return;
      }
      entries.forEach((e) => {
        if (e.isIntersecting) {
          revealIfPending(e.target as HTMLElement);
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -40% 0px', threshold: 0.05 },
  );
  nodes.forEach((el) => io.observe(el));

  schedule(() => {
    if (!decided) {
      decided = true;
      io.disconnect();
      showAllStaggered();
    }
  }, FALLBACK_MS);

  return () => {
    pendingTimeouts.forEach((id) => window.clearTimeout(id));
    pendingTimeouts.clear();
    window.removeEventListener('scroll', onScroll);
    io.disconnect();
  };
}
```

- [ ] **Step 4: Rodar e confirmar sucesso**

```bash
pnpm test src/components/motion/reveal.test.ts
```

Esperado: PASS, 6 testes.

- [ ] **Step 5: Escrever o teste de `magnetic.ts` — `src/components/motion/magnetic.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { magneticOffset } from './magnetic';

const box = { left: 0, top: 0, width: 100, height: 40 };

describe('magneticOffset', () => {
  it('is zero at the element center', () => {
    expect(magneticOffset({ x: 50, y: 20 }, box)).toEqual({ dx: 0, dy: 0 });
  });

  it('scales the distance from center by the default strength (0.18)', () => {
    const { dx, dy } = magneticOffset({ x: 150, y: 20 }, box);
    expect(dx).toBeCloseTo((150 - 50) * 0.18);
    expect(dy).toBeCloseTo(0);
  });

  it('accepts a custom strength', () => {
    const squareBox = { left: 0, top: 0, width: 100, height: 100 };
    const { dx, dy } = magneticOffset({ x: 200, y: 200 }, squareBox, 0.5);
    expect(dx).toBeCloseTo((200 - 50) * 0.5);
    expect(dy).toBeCloseTo((200 - 50) * 0.5);
  });
});
```

- [ ] **Step 6: Rodar e confirmar falha, depois implementar `src/components/motion/magnetic.ts`**

```bash
pnpm test src/components/motion/magnetic.test.ts
```

```ts
export function magneticOffset(
  cursor: { x: number; y: number },
  box: { left: number; top: number; width: number; height: number },
  strength = 0.18,
): { dx: number; dy: number } {
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;
  return {
    dx: (cursor.x - centerX) * strength,
    dy: (cursor.y - centerY) * strength,
  };
}

export function bindMagnetic(root: ParentNode = document): () => void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]'));
  const bound = elements.map((el) => {
    el.style.willChange = 'transform';
    const onMove = (e: MouseEvent) => {
      const { dx, dy } = magneticOffset({ x: e.clientX, y: e.clientY }, el.getBoundingClientRect());
      el.style.transition = 'transform .12s linear';
      el.style.transform = `translate3d(${dx.toFixed(1)}px,${dy.toFixed(1)}px,0)`;
    };
    const onLeave = () => {
      el.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1)';
      el.style.transform = 'translate3d(0,0,0)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return { el, onMove, onLeave };
  });

  return () => {
    bound.forEach(({ el, onMove, onLeave }) => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    });
  };
}
```

Rodar de novo: `pnpm test src/components/motion/magnetic.test.ts` — esperado PASS, 3 testes.

- [ ] **Step 7: Escrever o teste de `parallax.ts` — `src/components/motion/parallax.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { parallaxOffset } from './parallax';

describe('parallaxOffset', () => {
  it('matches the prototype formula (top+height/2-vh/2) * -speed', () => {
    expect(parallaxOffset(100, 200, 800, 0.05)).toBeCloseTo((100 + 100 - 400) * -0.05);
  });

  it('is zero when the element center matches the viewport center', () => {
    expect(parallaxOffset(300, 200, 800, 0.06)).toBeCloseTo(0);
  });

  it('flips sign correctly above vs. below the viewport center', () => {
    expect(parallaxOffset(0, 0, 800, 0.05)).toBeGreaterThan(0);
    expect(parallaxOffset(800, 0, 800, 0.05)).toBeLessThan(0);
  });
});
```

- [ ] **Step 8: Rodar e confirmar falha, depois implementar `src/components/motion/parallax.ts`**

```bash
pnpm test src/components/motion/parallax.test.ts
```

```ts
import { prefersReducedMotion } from '../../lib/motion-prefs';

export function parallaxOffset(rectTop: number, rectHeight: number, viewportHeight: number, speed: number): number {
  return (rectTop + rectHeight / 2 - viewportHeight / 2) * -speed;
}

export function bindParallax(root: ParentNode = document): () => void {
  const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!elements.length) return () => {};

  let rafId = 0;
  const apply = () => {
    rafId = 0;
    if (prefersReducedMotion()) {
      elements.forEach((el) => {
        el.style.transform = 'translate3d(0,0,0)';
      });
      return;
    }
    const vh = window.innerHeight;
    elements.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax') ?? '0.05');
      const rect = el.getBoundingClientRect();
      const offset = parallaxOffset(rect.top, rect.height, vh, speed);
      el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
    });
  };

  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(apply);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();

  return () => {
    window.removeEventListener('scroll', onScroll);
    if (rafId) cancelAnimationFrame(rafId);
  };
}
```

Rodar de novo: `pnpm test src/components/motion/parallax.test.ts` — esperado PASS, 3 testes.

- [ ] **Step 9: Criar `src/components/motion/bootstrap.ts`** (religa os três em cada troca de idioma — ver Global Constraints, gotcha de View Transitions)

```ts
import { bindMagnetic } from './magnetic';
import { bindParallax } from './parallax';
import { setupReveal } from './reveal';

let cleanup: (() => void) | null = null;

// astro:page-load dispara tanto no load inicial quanto após cada navegação
// do ClientRouter — um único listener cobre os dois casos.
document.addEventListener('astro:page-load', () => {
  cleanup?.();
  const cleanups = [bindMagnetic(), bindParallax(), setupReveal()];
  cleanup = () => cleanups.forEach((fn) => fn());
});
```

- [ ] **Step 10: Rodar toda a suíte e confirmar que nada quebrou**

```bash
pnpm test
```

Esperado: PASS, todos os testes de `motion/` e `lib/` e `locales/` juntos.

- [ ] **Step 11: Commit**

```bash
git add src/components/motion/
git commit -m "feat: port reveal, magnetic and parallax motion utilities with tests"
```

---

### Task 6: Content collection `projects` — schema + seeds

**Files:**
- Create: `src/content/projectSchema.ts`, `src/content/config.ts`, `src/content/projects/savemoney.mdx`, `src/content/projects/guysmovies.mdx`
- Test: `src/content/projectSchema.test.ts`

**Interfaces:**
- Produces: `projectSchema` (Zod, testável isoladamente), `collections.projects` (consumido por `src/pages/index.astro` e `en/index.astro` via `getCollection('projects')` — Task 8; renderizado por `Projects.astro`/`ProjectCard.astro` — Task 11).

- [ ] **Step 1: Escrever o teste do schema — `src/content/projectSchema.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { projectSchema } from './projectSchema';

const valid = {
  order: 1,
  title: { pt: 'SaveMoney', en: 'SaveMoney' },
  description: {
    pt: 'Gestão de finanças pessoais.',
    en: 'Personal finance manager.',
  },
  stack: ['React', 'NestJS'],
  link: 'https://personal-management-jade.vercel.app',
};

describe('projectSchema', () => {
  it('accepts a valid project', () => {
    expect(projectSchema.parse(valid)).toMatchObject(valid);
  });

  it('accepts the optional year and repo fields', () => {
    const withOptionals = { ...valid, year: '2024', repo: 'https://github.com/example/repo' };
    expect(projectSchema.parse(withOptionals)).toMatchObject(withOptionals);
  });

  it('rejects a project missing the link', () => {
    const { link: _link, ...withoutLink } = valid;
    expect(() => projectSchema.parse(withoutLink)).toThrow();
  });

  it('rejects a link that is not a URL', () => {
    expect(() => projectSchema.parse({ ...valid, link: 'not-a-url' })).toThrow();
  });

  it('rejects a non-array stack', () => {
    expect(() => projectSchema.parse({ ...valid, stack: 'React' })).toThrow();
  });

  it('rejects a title missing one of the two locales', () => {
    expect(() => projectSchema.parse({ ...valid, title: { pt: 'SaveMoney' } })).toThrow();
  });
});
```

- [ ] **Step 2: Rodar e confirmar falha**

```bash
pnpm test src/content/projectSchema.test.ts
```

Esperado: FAIL — módulo não existe.

- [ ] **Step 3: Implementar `src/content/projectSchema.ts`**

```ts
import { z } from 'zod';

export const projectSchema = z.object({
  order: z.number(),
  year: z.string().optional(),
  title: z.object({ pt: z.string(), en: z.string() }),
  description: z.object({ pt: z.string(), en: z.string() }),
  stack: z.array(z.string()),
  link: z.string().url(),
  repo: z.string().url().optional(),
});

export type ProjectFrontmatter = z.infer<typeof projectSchema>;
```

- [ ] **Step 4: Rodar e confirmar sucesso**

```bash
pnpm test src/content/projectSchema.test.ts
```

Esperado: PASS, 6 testes.

- [ ] **Step 5: Criar `src/content/config.ts`** (camada Astro-only por cima do schema testável — `image()` só existe em runtime do Astro, por isso fica fora do arquivo testado)

```ts
import { defineCollection } from 'astro:content';
import { projectSchema } from './projectSchema';

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => projectSchema.extend({ image: image().optional() }),
});

export const collections = { projects };
```

- [ ] **Step 6: Criar os dois projetos seed, dados verbatim de `Portfolio.dc.html` linhas 236–237 e 268–269**

`src/content/projects/savemoney.mdx`:

```mdx
---
order: 1
title:
  pt: SaveMoney
  en: SaveMoney
description:
  pt: "Gestão de finanças pessoais: dashboard, geração de relatórios e job automático de gastos recorrentes."
  en: "Personal finance manager: dashboard, report generation and an automated recurring-expenses job."
stack: [React, NestJS, TypeORM, PostgreSQL, JWT, Tailwind]
link: https://personal-management-jade.vercel.app
---
```

(Os valores de `description` precisam de aspas — sem elas, o `: ` depois de "pessoais"/"manager" quebra o parser YAML, que interpretaria como um novo mapeamento aninhado.)

`src/content/projects/guysmovies.mdx`:

```mdx
---
order: 2
title:
  pt: GuysMovies
  en: GuysMovies
description:
  pt: "Catálogo de filmes e séries com comunidade: usuários compartilham experiências e avaliações, com dados do TMDB."
  en: "Movie and series catalog with a community layer: users share reviews and experiences, powered by TMDB data."
stack: [React, NestJS, TypeORM, PostgreSQL, JWT, "TMDB API"]
link: https://guys-movies-frontend.vercel.app/
---
```

Nenhum dos dois define `image` — cai no placeholder listrado (`t.noPreview`) em `ProjectCard.astro`, Task 11.

- [ ] **Step 7: Verificar que a collection é lida pelo Astro**

```bash
pnpm astro sync
pnpm build
```

Esperado: sem erro de validação de schema.

- [ ] **Step 8: Commit**

```bash
git add src/content/
git commit -m "feat: add projects content collection with Zod schema and two seed projects"
```

---

### Task 7: Dados fixos (`experience.ts`, `stack.ts`, `social.ts`)

**Files:**
- Create: `src/data/experience.ts`, `src/data/stack.ts`, `src/data/social.ts`
- Create: `src/lib/types.ts`

**Interfaces:**
- Produces: `LocalizedText { pt, en }` (de `lib/types.ts`); `experience: ExperienceEntry[]`; `stack: string[]`, `practices: LocalizedText[]`; `social: SocialLink[]` com `id: 'instagram'|'linkedin'|'github'|'whatsapp'`. Consumidos por `Experience.astro`, `StackMarquee.astro`, `Contact.astro`/`SocialIcon.astro` no Task 11.

Sem testes automatizados nesta task — são dados estáticos tipados, fora do escopo de Vitest definido na spec (`§6`/Global Constraints).

- [ ] **Step 1: Criar `src/lib/types.ts`**

```ts
export interface LocalizedText {
  pt: string;
  en: string;
}
```

- [ ] **Step 2: Criar `src/data/experience.ts`** (verbatim de `Portfolio.dc.html` linhas 230–233 e 262–265)

```ts
import type { LocalizedText } from '../lib/types';

export interface ExperienceEntry {
  period: LocalizedText;
  company: string;
  role: LocalizedText;
  description: LocalizedText;
}

export const experience: ExperienceEntry[] = [
  {
    period: { pt: 'Atual', en: 'Current' },
    company: 'KaBuM!',
    role: { pt: 'Software Engineer', en: 'Software Engineer' },
    description: {
      pt: 'Responsável pelos sistemas de comunicação com o cliente — mensageria, integrações e confiabilidade da entrega.',
      en: 'Owner of customer communication systems — messaging, integrations and delivery reliability.',
    },
  },
  {
    period: { pt: 'Anterior', en: 'Previous' },
    company: 'RC Soluções',
    role: { pt: 'Estágio · Software Developer', en: 'Intern · Software Developer' },
    description: {
      pt: 'Desenvolvimento front-end em React nos projetos da empresa, da interface à integração com API.',
      en: 'Front-end development in React across company projects, from UI to API integration.',
    },
  },
];
```

- [ ] **Step 3: Criar `src/data/stack.ts`** (verbatim de `Portfolio.dc.html` linhas 240–241 e 272–273)

```ts
import type { LocalizedText } from '../lib/types';

export const stack: string[] = [
  'TypeScript',
  'NestJS',
  'Next.js',
  'React',
  'Node',
  'MySQL',
  'PostgreSQL',
  'KafkaJS',
  'Docker',
  'AWS',
  'Python',
];

export const practices: LocalizedText[] = [
  { pt: 'Mensageria', en: 'Messaging' },
  { pt: 'Observabilidade', en: 'Observability' },
  { pt: 'REST · GraphQL', en: 'REST · GraphQL' },
  { pt: 'CI/CD', en: 'CI/CD' },
  { pt: 'Testes automatizados', en: 'Automated testing' },
  { pt: 'TypeORM · Prisma', en: 'TypeORM · Prisma' },
  { pt: 'Filas e eventos', en: 'Queues and events' },
];
```

- [ ] **Step 4: Criar `src/data/social.ts`** (verbatim de `Portfolio.dc.html` linhas 179–205)

```ts
export interface SocialLink {
  id: 'instagram' | 'linkedin' | 'github' | 'whatsapp';
  href: string;
  label: string;
}

export const social: SocialLink[] = [
  { id: 'instagram', href: 'https://www.instagram.com/andre.freitaszz', label: 'Instagram' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/andré-freitas-462940200', label: 'LinkedIn' },
  { id: 'github', href: 'https://github.com/AndreFreitasz', label: 'GitHub' },
  { id: 'whatsapp', href: 'https://wa.me/5519999683757', label: 'WhatsApp' },
];
```

- [ ] **Step 5: Verificar tipos**

```bash
pnpm check
```

Esperado: 0 erros de TypeScript.

- [ ] **Step 6: Commit**

```bash
git add src/data/ src/lib/types.ts
git commit -m "feat: add experience, stack and social data files"
```

---

### Task 8: `astro.config.ts` i18n (já feito no Task 1) + `BaseLayout.astro` + páginas

**Files:**
- Modify: `src/pages/index.astro` (substitui o placeholder do Task 1)
- Create: `src/layouts/BaseLayout.astro`, `src/pages/en/index.astro`

**Interfaces:**
- Consumes: `useTranslations` de `src/locales/utils.ts` ([[Task 3]]); `getCollection('projects')` de `src/content/config.ts` ([[Task 6]]); componentes de `chrome/` e `sections/` do Task 9 em diante (nesta task, `BaseLayout` já importa os componentes — eles são implementados no Task 9, então este arquivo só compila de fato ao final do Task 9; ver nota no Step 4).
- Produces: rotas `/` e `/en/` navegáveis.

- [ ] **Step 1: Criar `src/layouts/BaseLayout.astro`**

```astro
---
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';
import AmbientCanvas from '../components/chrome/AmbientCanvas';
import CustomCursor from '../components/chrome/CustomCursor';
import ScrollProgress from '../components/chrome/ScrollProgress.astro';
import IntroSplash from '../components/sections/IntroSplash';
import type { Locale } from '../locales/locales';

interface Props {
  locale: Locale;
  title: string;
  description: string;
}
const { locale, title, description } = Astro.props;
---

<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content="/og-image.jpg" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <ClientRouter />
  </head>
  <body class="m-0 bg-ink font-body text-paper antialiased">
    <IntroSplash client:load transition:persist="intro" />
    <AmbientCanvas client:load transition:persist="ambient-canvas" />
    <div
      class="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(211,242,78,.05),transparent_70%)]"
    >
    </div>
    <ScrollProgress transition:persist="scroll-progress" />
    <CustomCursor client:load transition:persist="custom-cursor" />
    <slot />
    <script>
      import '../components/motion/bootstrap';
    </script>
  </body>
</html>
```

- [ ] **Step 2: Substituir `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/chrome/Header.astro';
import Hero from '../components/sections/Hero.astro';
import About from '../components/sections/About.astro';
import Experience from '../components/sections/Experience.astro';
import Projects from '../components/sections/Projects.astro';
import StackMarquee from '../components/sections/StackMarquee.astro';
import Contact from '../components/sections/Contact.astro';
import { useTranslations } from '../locales/utils';

const locale = 'pt' as const;
const t = useTranslations(locale);
const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout locale={locale} title={`André Freitas — ${t.h1a} ${t.h1b}`} description={t.heroSub}>
  <Header locale={locale} />
  <main id="top" class="mx-auto max-w-[1180px] px-7">
    <Hero locale={locale} />
    <About locale={locale} />
    <Experience locale={locale} />
    <Projects locale={locale} projects={projects} />
    <StackMarquee locale={locale} />
    <Contact locale={locale} />
    <footer
      class="flex flex-wrap justify-between gap-4 border-t border-border py-8 font-mono text-[11px] uppercase tracking-[.2em] text-muted-soft"
    >
      <span>André Freitas · 2026</span>
      <span>{t.footer}</span>
    </footer>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Criar `src/pages/en/index.astro`** (idêntico, `locale = 'en'`)

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Header from '../../components/chrome/Header.astro';
import Hero from '../../components/sections/Hero.astro';
import About from '../../components/sections/About.astro';
import Experience from '../../components/sections/Experience.astro';
import Projects from '../../components/sections/Projects.astro';
import StackMarquee from '../../components/sections/StackMarquee.astro';
import Contact from '../../components/sections/Contact.astro';
import { useTranslations } from '../../locales/utils';

const locale = 'en' as const;
const t = useTranslations(locale);
const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
---

<BaseLayout locale={locale} title={`André Freitas — ${t.h1a} ${t.h1b}`} description={t.heroSub}>
  <Header locale={locale} />
  <main id="top" class="mx-auto max-w-[1180px] px-7">
    <Hero locale={locale} />
    <About locale={locale} />
    <Experience locale={locale} />
    <Projects locale={locale} projects={projects} />
    <StackMarquee locale={locale} />
    <Contact locale={locale} />
    <footer
      class="flex flex-wrap justify-between gap-4 border-t border-border py-8 font-mono text-[11px] uppercase tracking-[.2em] text-muted-soft"
    >
      <span>André Freitas · 2026</span>
      <span>{t.footer}</span>
    </footer>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Nota de ordem de execução**

`pnpm build` só vai passar ao final do Task 9 (componentes de `chrome/` e `sections/IntroSplash.tsx` ainda não existem) e do Task 11 (demais seções). Não rodar `pnpm build` neste ponto — seguir direto para o Task 9. `pnpm test` continua funcionando normalmente (não depende de componentes Astro/React).

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/
git commit -m "feat: add BaseLayout and pt/en page shells"
```

---

### Task 9: Ilhas persistentes de chrome — `IntroSplash`, `AmbientCanvas`, `CustomCursor`, `ScrollProgress`

**Files:**
- Create: `src/components/sections/IntroSplash.tsx`, `src/components/chrome/AmbientCanvas.tsx`, `src/components/chrome/CustomCursor.tsx`, `src/components/chrome/ScrollProgress.astro`

**Interfaces:**
- Consumes: `INTRO_DURATION_MS`, `introAlreadySeen`, `markIntroSeen` de `src/lib/intro.ts` ([[Task 4]]); `prefersReducedMotion` de `src/lib/motion-prefs.ts` ([[Task 4]]).
- Produces: os 4 componentes que `BaseLayout.astro` já importa desde o Task 8 — depois desta task o `pnpm build` volta a compilar (ainda faltam as seções de conteúdo do Task 11, então o build só fecha 100% depois delas).

- [ ] **Step 1: Criar `src/components/sections/IntroSplash.tsx`** (porta literal de `Portfolio.dc.html` linhas 36–45; `visible` começa `true` para casar com o `state.intro:true` original e evitar um flash de conteúdo sem overlay antes da hidratação)

```tsx
import { useEffect, useState } from 'react';
import { INTRO_DURATION_MS, introAlreadySeen, markIntroSeen } from '../../lib/intro';

export default function IntroSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (introAlreadySeen()) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
      markIntroSeen();
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-ink"
      style={{ animation: 'afWipe 2.3s cubic-bezier(.76,0,.24,1) forwards' }}
    >
      <div className="grid justify-items-center gap-[22px]">
        <div
          className="flex h-[124px] w-[124px] items-center justify-center overflow-hidden bg-volt text-ink"
          style={{ animation: 'afTile 1.5s cubic-bezier(.16,1,.3,1) both' }}
        >
          <span
            className="font-display text-[64px] leading-[.8] tracking-[-.07em]"
            style={{ animation: 'afLeft 1.5s cubic-bezier(.16,1,.3,1) both' }}
          >
            A
          </span>
          <span
            className="font-display text-[64px] leading-[.8] tracking-[-.07em]"
            style={{ animation: 'afRight 1.5s cubic-bezier(.16,1,.3,1) both' }}
          >
            F
          </span>
        </div>
        <div
          className="h-[2px] w-[180px] origin-left bg-border-hover"
          style={{ animation: 'afRule 1.8s cubic-bezier(.76,0,.24,1) both' }}
        />
        <div
          className="font-mono text-[11px] uppercase tracking-[.34em] text-muted-label"
          style={{ animation: 'afFadeUp .9s .5s cubic-bezier(.16,1,.3,1) both' }}
        >
          André Freitas
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `src/components/chrome/AmbientCanvas.tsx`** (porta literal de `Portfolio.dc.html` linhas 299–383 — 216 partículas, grid de 130px, repulsão de mouse raio 190px/força 46px, dpr≤2)

```tsx
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion-prefs';

const PARTICLE_COUNT = 216;
const CELL = 130;
const MOUSE_RADIUS = 190;
const MOUSE_FORCE = 46;

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hot: boolean;
  ph: number;
  sp: number;
}

export default function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (prefersReducedMotion()) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const dots: Dot[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
      r: 0.5 + Math.random() * 2.1,
      hot: Math.random() < 0.22,
      ph: Math.random() * Math.PI * 2,
      sp: 0.6 + Math.random() * 1.4,
    }));

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let mouseX = -999;
    let mouseY = -999;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let frame = 0;
    let rafId = 0;

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;
      const points = dots.map((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
        let px = d.x * width;
        let py = d.y * height;
        const dx = px - mouseX;
        const dy = py - mouseY;
        const dist = Math.hypot(dx, dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
          px += (dx / (dist || 1)) * force;
          py += (dy / (dist || 1)) * force;
        }
        return { px, py, d, near: dist < MOUSE_RADIUS };
      });

      const grid = new Map<string, number[]>();
      points.forEach((p, i) => {
        const key = `${(p.px / CELL) | 0}:${(p.py / CELL) | 0}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(i);
      });

      ctx.lineWidth = 1;
      grid.forEach((bucket, key) => {
        const [cx, cy] = key.split(':').map(Number);
        const neighbors: number[][] = [];
        for (let ox = 0; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            if (ox === 0 && oy < 0) continue;
            const b = grid.get(`${cx + ox}:${cy + oy}`);
            if (b) neighbors.push(b);
          }
        }
        bucket.forEach((i) => {
          neighbors.forEach((b) =>
            b.forEach((j) => {
              if (j <= i) return;
              const dd = Math.hypot(points[i].px - points[j].px, points[i].py - points[j].py);
              if (dd < CELL) {
                ctx.strokeStyle = `rgba(211,242,78,${(0.05 * (1 - dd / CELL)).toFixed(3)})`;
                ctx.beginPath();
                ctx.moveTo(points[i].px, points[i].py);
                ctx.lineTo(points[j].px, points[j].py);
                ctx.stroke();
              }
            }),
          );
        });
      });

      points.forEach((p) => {
        const base = p.d.hot ? '255,156,123' : '211,242,78';
        const pulse = 0.72 + 0.28 * Math.sin(frame * 0.018 * p.d.sp + p.d.ph);
        ctx.fillStyle = `rgba(${base},${((p.near ? 0.55 : 0.2) * pulse).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.d.r * (p.near ? 1.7 : 1) * pulse, 0, Math.PI * 2);
        ctx.fill();
        if (p.near) {
          ctx.strokeStyle = `rgba(${base},.18)`;
          ctx.beginPath();
          ctx.arc(p.px, p.py, p.d.r * 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (mouseX > -500) {
        const ringRadius = 150 + Math.sin(frame * 0.05) * 12;
        ctx.strokeStyle = 'rgba(211,242,78,.07)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255,156,123,.05)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, ringRadius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90" />;
}
```

- [ ] **Step 3: Criar `src/components/chrome/CustomCursor.tsx`** (porta literal de `Portfolio.dc.html` linhas 504–525 — dot 7px, ring 32px, lerp 0.16)

```tsx
import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion-prefs';

const LERP = 0.16;

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (prefersReducedMotion()) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = -100;
    let y = -100;
    let ringX = -100;
    let ringY = -100;
    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    let rafId = 0;
    const loop = () => {
      ringX += (x - ringX) * LERP;
      ringY += (y - ringY) * LERP;
      dot.style.transform = `translate3d(${x - 3.5}px,${y - 3.5}px,0)`;
      ring.style.transform = `translate3d(${ringX - 16}px,${ringY - 16}px,0)`;
      rafId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <>
      <div
        id="afCursor"
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[130] h-[7px] w-[7px] -translate-x-[100px] -translate-y-[100px] rounded-full bg-volt"
      />
      <div
        id="afRing"
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[130] h-8 w-8 -translate-x-[100px] -translate-y-[100px] rounded-full border border-volt/45 transition-[width,height] duration-200"
      />
    </>
  );
}
```

- [ ] **Step 4: Criar `src/components/chrome/ScrollProgress.astro`** (script inline, sem framework; o listener é adicionado 1x porque o nó persiste entre navegações — ver `transition:persist` no `BaseLayout`)

```astro
---
---

<div data-progress class="fixed left-0 top-0 z-[110] h-[2px] w-0 bg-volt"></div>
<script>
  function update() {
    const bar = document.querySelector<HTMLElement>('[data-progress]');
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  }
  // Este nó tem transition:persist: o script só roda uma vez de fato
  // (o DOM sobrevive às navegações), por isso não precisa re-bindar
  // em astro:page-load como os utilitários de motion/.
  document.addEventListener('astro:page-load', () => {
    update();
    window.addEventListener('scroll', update, { passive: true });
  });
</script>
```

- [ ] **Step 5: Verificar tipos e rodar em dev**

```bash
pnpm check
pnpm dev
```

Abrir `http://localhost:4321` — a página ainda não renderiza `<Header>`/seções (faltam no Task 11), mas não deve haver erro de import quebrado no console relativo a `chrome/` ou `IntroSplash`.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/IntroSplash.tsx src/components/chrome/AmbientCanvas.tsx src/components/chrome/CustomCursor.tsx src/components/chrome/ScrollProgress.astro
git commit -m "feat: port intro splash, ambient canvas, custom cursor and scroll progress islands"
```

---

### Task 10: `Header.astro`, `LangSwitch.astro`, `Marquee.astro`

**Files:**
- Create: `src/components/chrome/LangSwitch.astro`, `src/components/chrome/Header.astro`, `src/components/motion/Marquee.astro`

**Interfaces:**
- Consumes: `useTranslations`, `getAlternateUrl` de `src/locales/utils.ts` ([[Task 3]]).
- Produces: `<Header locale={locale} />` (consumido pelas páginas desde o Task 8); `<Marquee items durationSeconds animation variant />` (consumido por `StackMarquee.astro`, Task 11).

- [ ] **Step 1: Criar `src/components/chrome/LangSwitch.astro`**

```astro
---
import type { Locale } from '../../locales/locales';
import { getAlternateUrl, useTranslations } from '../../locales/utils';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = useTranslations(locale);
const target: Locale = locale === 'pt' ? 'en' : 'pt';
const href = getAlternateUrl(Astro.url.pathname, target);
---

<a
  data-magnetic
  href={href}
  class="ml-2 border border-border-hover px-3 py-[9px] font-mono text-[11px] tracking-[.14em] text-paper transition-colors hover:border-volt hover:text-volt"
>
  {t.langLabel}
</a>
```

- [ ] **Step 2: Criar `src/components/chrome/Header.astro`** (sem `transition:persist`: o texto de navegação muda entre PT/EN, então precisa re-renderizar a cada troca de idioma — só o chrome verdadeiramente independente de idioma, `AmbientCanvas`/`CustomCursor`/`ScrollProgress`/`IntroSplash`, persiste)

```astro
---
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';
import LangSwitch from './LangSwitch.astro';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = useTranslations(locale);
---

<header class="sticky top-0 z-[100] border-b border-border bg-ink/86 backdrop-blur-md">
  <div class="mx-auto flex max-w-[1180px] items-center justify-between gap-[18px] px-7 py-4">
    <a href="#top" aria-label="André Freitas" class="flex items-center gap-3">
      <span
        class="flex h-[34px] w-[34px] items-center justify-center bg-volt font-display text-[17px] tracking-[-.07em] text-ink"
      >
        AF
      </span>
    </a>
    <nav class="flex flex-wrap items-center justify-end gap-1">
      <a
        data-magnetic
        href="#sobre"
        class="px-3 py-[10px] font-mono text-[11px] uppercase tracking-[.2em] text-muted-body transition-colors hover:text-volt"
      >
        {t.nav1}
      </a>
      <a
        data-magnetic
        href="#experiencia"
        class="px-3 py-[10px] font-mono text-[11px] uppercase tracking-[.2em] text-muted-body transition-colors hover:text-volt"
      >
        {t.nav2}
      </a>
      <a
        data-magnetic
        href="#projetos"
        class="px-3 py-[10px] font-mono text-[11px] uppercase tracking-[.2em] text-muted-body transition-colors hover:text-volt"
      >
        {t.nav3}
      </a>
      <a
        data-magnetic
        href="#contato"
        class="px-3 py-[10px] font-mono text-[11px] uppercase tracking-[.2em] text-muted-body transition-colors hover:text-volt"
      >
        {t.nav5}
      </a>
      <LangSwitch locale={locale} />
    </nav>
  </div>
</header>
```

- [ ] **Step 3: Criar `src/components/motion/Marquee.astro`**

```astro
---
interface Props {
  items: string[];
  animation: 'afMarquee' | 'afMarqueeRev';
  durationSeconds: number;
  variant?: 'chip' | 'plain';
}
const { items, animation, durationSeconds, variant = 'chip' } = Astro.props;
const loop = [...items, ...items];
---

<div class="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)]">
  <div
    data-marquee
    class={variant === 'chip' ? 'flex w-max gap-3' : 'flex w-max gap-10'}
    style={`animation: ${animation} ${durationSeconds}s linear infinite;`}
  >
    {
      loop.map((item) =>
        variant === 'chip' ? (
          <span class="flex items-center gap-[9px] whitespace-nowrap border border-border-strong px-4 py-[11px] font-mono text-[13px] tracking-[.06em] text-muted-bright transition-colors duration-[250ms] hover:border-volt hover:text-volt">
            <span class="h-[6px] w-[6px] flex-none rotate-45 bg-volt" />
            {item}
          </span>
        ) : (
          <span class="whitespace-nowrap font-mono text-xs uppercase tracking-[.18em] text-muted-soft">{item}</span>
        ),
      )
    }
  </div>
</div>
```

- [ ] **Step 4: Verificar tipos**

```bash
pnpm check
```

- [ ] **Step 5: Commit**

```bash
git add src/components/chrome/Header.astro src/components/chrome/LangSwitch.astro src/components/motion/Marquee.astro
git commit -m "feat: add header, language switch and reusable marquee component"
```

---

### Task 11: Componentes de UI + seções de conteúdo

**Files:**
- Create: `src/components/ui/SectionLabel.astro`, `src/components/ui/Tag.astro`, `src/components/ui/SocialIcon.astro`
- Create: `src/components/sections/Hero.astro`, `src/components/sections/About.astro`, `src/components/sections/Experience.astro`, `src/components/sections/Projects.astro`, `src/components/sections/ProjectCard.astro`, `src/components/sections/StackMarquee.astro`, `src/components/sections/Contact.astro`
- Create: `src/assets/andre.jpg` (copiar de `design-reference/assets/andre.jpeg`)

**Interfaces:**
- Consumes: `useTranslations` ([[Task 3]]); `experience`, `stack`, `practices`, `social` ([[Task 7]]); `CollectionEntry<'projects'>` ([[Task 6]]); `Marquee.astro` ([[Task 10]]).
- Produces: as 6 seções que `src/pages/index.astro`/`en/index.astro` já importam desde o Task 8 — ao final desta task, `pnpm build` fecha 100%.

- [ ] **Step 1: Copiar a foto para `src/assets/`**

```bash
cp "design-reference/assets/andre.jpeg" "src/assets/andre.jpg"
```

(`src/assets/` é processado por `astro:assets` — precisa estar dentro de `src/`, diferente de `design-reference/` que é só arquivo morto.)

- [ ] **Step 2: Criar `src/components/ui/SectionLabel.astro`**

```astro
---
interface Props {
  index: string;
  title: string;
}
const { index, title } = Astro.props;
---

<div class="mb-11 flex flex-wrap items-baseline gap-[18px]">
  <div data-anim="left" class="font-mono text-[11px] uppercase tracking-[.34em] text-volt">{index}</div>
  <h2 data-line class="m-0 overflow-hidden font-display text-[clamp(30px,5vw,56px)] leading-none tracking-[-.035em]">
    <span class="block">{title}</span>
  </h2>
</div>
```

- [ ] **Step 3: Criar `src/components/ui/Tag.astro`**

```astro
---
interface Props {
  anim?: string;
}
const { anim = 'pop' } = Astro.props;
---

<span data-anim={anim} class="border border-border-strong px-[11px] py-[7px] font-mono text-[11px] tracking-[.1em] text-muted-soft">
  <slot />
</span>
```

- [ ] **Step 4: Criar `src/components/ui/SocialIcon.astro`** (paths SVG literais de `Portfolio.dc.html` linhas 180–203)

```astro
---
import type { SocialLink } from '../../data/social';

interface Props {
  link: SocialLink;
}
const { link } = Astro.props;

const icons: Record<SocialLink['id'], string> = {
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"></circle>',
  linkedin:
    '<rect x="3" y="3" width="18" height="18" rx="3"></rect><line x1="8" y1="11" x2="8" y2="17"></line><circle cx="8" cy="7.6" r="1.1" fill="currentColor" stroke="none"></circle><path d="M12 17v-3.4a2.6 2.6 0 0 1 5.2 0V17"></path>',
  github:
    '<path d="M9 19.3c-4 1.2-4-2.1-5.6-2.5m11.2 5v-3.5c0-1 .1-1.4-.5-2 2.3-.26 4.4-1.13 4.4-5a3.9 3.9 0 0 0-1.1-2.7 3.6 3.6 0 0 0-.1-2.75s-1.2-.35-3.9 1.5a9.3 9.3 0 0 0-5 0C5.7 5.05 4.5 5.4 4.5 5.4a3.6 3.6 0 0 0-.1 2.75A3.9 3.9 0 0 0 3.3 10.9c0 3.84 2.1 4.71 4.4 5-.6.6-.6 1.2-.5 2v3.5"></path>',
  whatsapp:
    '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.45L3.5 20.5l1.5-4.3A8.5 8.5 0 1 1 20.5 11.6z"></path><path d="M9 9.2c0 3.1 2.7 5.8 5.8 5.8.5 0 1-.4 1-.9v-.9l-1.9-.7-.9 1a6.4 6.4 0 0 1-2.6-2.6l1-.9-.7-1.9h-.9c-.5 0-.9.5-.9 1.1z"></path>',
};
---

<a
  data-magnetic
  data-anim="pop"
  href={link.href}
  target="_blank"
  rel="noopener"
  aria-label={link.label}
  class="grid h-[62px] w-[62px] place-items-center border border-border-hover text-paper transition-colors hover:border-volt hover:bg-volt hover:text-ink"
>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    set:html={icons[link.id]}
  />
</a>
```

- [ ] **Step 5: Criar `src/components/sections/Hero.astro`**

```astro
---
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = useTranslations(locale);
---

<section data-reveal class="flex min-h-[82vh] flex-col justify-center py-[88px] pb-[72px]">
  <div data-anim="left" class="mb-[30px] font-mono text-[11px] uppercase tracking-[.34em] text-volt">
    André Freitas
  </div>
  <h1 class="mb-8 font-display text-[clamp(44px,9.4vw,132px)] leading-[.86] tracking-[-.05em]">
    <span data-line class="block overflow-hidden"><span class="block">{t.h1a}</span></span>
    <span data-line class="block overflow-hidden"><span class="block text-volt">{t.h1b}</span></span>
  </h1>
  <p data-anim="up" class="mb-[38px] max-w-[600px] text-[clamp(17px,2vw,21px)] leading-[1.55] text-muted-body [text-wrap:pretty]">
    {t.heroSub}
  </p>
  <div data-anim="up" class="flex flex-wrap gap-3">
    <a
      data-magnetic
      href="#projetos"
      class="bg-volt px-6 py-[17px] font-mono text-xs uppercase tracking-[.2em] text-ink transition-colors hover:bg-ember"
    >
      {t.ctaWork}
    </a>
    <a
      data-magnetic
      href="/curriculo.pdf"
      target="_blank"
      rel="noopener"
      class="border border-border-hover px-6 py-[17px] font-mono text-xs uppercase tracking-[.2em] text-paper transition-colors hover:border-volt hover:text-volt"
    >
      {t.ctaCv}
    </a>
  </div>
</section>
```

- [ ] **Step 6: Criar `src/components/sections/About.astro`**

```astro
---
import { Image } from 'astro:assets';
import andre from '../../assets/andre.jpg';
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';
import SectionLabel from '../ui/SectionLabel.astro';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = useTranslations(locale);
---

<section id="sobre" data-reveal class="border-t border-border py-24">
  <SectionLabel index="01" title={t.aboutTitle} />
  <div class="grid items-start gap-11 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
    <div class="grid gap-5">
      <p data-anim="left" class="m-0 text-lg leading-[1.6] text-muted-bright [text-wrap:pretty]">{t.about1}</p>
      <p data-anim="left" class="m-0 text-base leading-[1.65] text-muted-body [text-wrap:pretty]">{t.about2}</p>
    </div>
    <div data-anim="right" class="w-full max-w-[420px] justify-self-end">
      <div data-parallax="0.06" class="photo-duotone relative aspect-[4/5] w-full overflow-hidden bg-ink">
        <Image
          src={andre}
          alt="André Freitas"
          class="h-full w-full object-cover"
          widths={[420, 840]}
          sizes="(min-width: 760px) 420px, 100vw"
        />
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 7: Criar `src/components/sections/Experience.astro`**

```astro
---
import { experience } from '../../data/experience';
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';
import SectionLabel from '../ui/SectionLabel.astro';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = useTranslations(locale);
---

<section id="experiencia" data-reveal class="border-t border-border py-24">
  <SectionLabel index="02" title={t.expTitle} />
  <div class="grid gap-[2px]">
    {
      experience.map((job) => (
        <article
          data-anim="auto"
          class="grid grid-cols-1 gap-[26px] border-l-2 border-border-strong bg-graphite p-[34px] transition-colors duration-[250ms] hover:border-volt hover:bg-graphite-2 sm:[grid-template-columns:minmax(0,200px)_minmax(0,1fr)]"
        >
          <div class="grid gap-2">
            <div class="font-mono text-[11px] uppercase tracking-[.22em] text-volt">{job.period[locale]}</div>
            <div class="font-display text-xl tracking-[-.02em]">{job.company}</div>
          </div>
          <div class="grid gap-[10px]">
            <div class="text-[17px] font-semibold text-paper">{job.role[locale]}</div>
            <p class="m-0 text-[15px] leading-[1.6] text-muted-body [text-wrap:pretty]">{job.description[locale]}</p>
          </div>
        </article>
      ))
    }
  </div>
</section>
```

- [ ] **Step 8: Criar `src/components/sections/ProjectCard.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import { Image } from 'astro:assets';
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';
import Tag from '../ui/Tag.astro';

interface Props {
  locale: Locale;
  project: CollectionEntry<'projects'>;
  number: string;
}
const { locale, project, number } = Astro.props;
const { data } = project;
const t = useTranslations(locale);
---

<article data-anim="auto" class="grid items-center gap-9 [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
  <a
    data-magnetic
    href={data.link}
    target="_blank"
    rel="noopener"
    class="relative block aspect-[16/10] overflow-hidden border border-border-strong bg-graphite transition-colors hover:border-volt"
  >
    {
      data.image ? (
        <Image
          src={data.image}
          alt={data.title[locale]}
          class="h-full w-full object-cover"
          widths={[400, 800]}
          sizes="(min-width: 760px) 50vw, 100vw"
        />
      ) : (
        <>
          <div
            data-parallax="0.04"
            class="absolute -inset-[8%] [background-image:repeating-linear-gradient(135deg,#22201D_0_10px,#1B1917_10px_20px)]"
          />
          <div class="absolute inset-0 grid place-items-center p-5 text-center">
            <div class="font-mono text-[11px] uppercase tracking-[.24em] text-muted-soft">{t.noPreview}</div>
          </div>
        </>
      )
    }
    <div class="absolute left-0 top-0 bg-volt px-3 py-2 font-mono text-[11px] tracking-[.2em] text-ink">{number}</div>
  </a>
  <div class="grid gap-[18px]">
    <h3 class="m-0 font-display text-[clamp(26px,3.4vw,40px)] leading-none tracking-[-.035em]">{data.title[locale]}</h3>
    <p class="m-0 text-base leading-[1.6] text-muted-body [text-wrap:pretty]">{data.description[locale]}</p>
    <div class="flex flex-wrap gap-2">
      {data.stack.map((tech) => <Tag>{tech}</Tag>)}
    </div>
    <a
      data-magnetic
      href={data.link}
      target="_blank"
      rel="noopener"
      class="justify-self-start border-b border-border-hover pb-[6px] font-mono text-xs uppercase tracking-[.2em] text-paper transition-colors hover:border-ember"
    >
      {t.visit}
    </a>
  </div>
</article>
```

- [ ] **Step 9: Criar `src/components/sections/Projects.astro`**

```astro
---
import type { CollectionEntry } from 'astro:content';
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';
import SectionLabel from '../ui/SectionLabel.astro';
import ProjectCard from './ProjectCard.astro';

interface Props {
  locale: Locale;
  projects: CollectionEntry<'projects'>[];
}
const { locale, projects } = Astro.props;
const t = useTranslations(locale);
---

<section id="projetos" data-reveal class="border-t border-border py-24">
  <SectionLabel index="03" title={t.projTitle} />
  <div class="grid gap-14">
    {
      projects.map((project, i) => (
        <ProjectCard locale={locale} project={project} number={String(i + 1).padStart(2, '0')} />
      ))
    }
  </div>
</section>
```

- [ ] **Step 10: Criar `src/components/sections/StackMarquee.astro`**

```astro
---
import { practices, stack } from '../../data/stack';
import type { Locale } from '../../locales/locales';
import Marquee from '../motion/Marquee.astro';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const practicesLocalized = practices.map((p) => p[locale]);
---

<section aria-label="Stack" class="overflow-hidden border-t border-border py-11">
  <div class="grid gap-4">
    <Marquee items={stack} animation="afMarquee" durationSeconds={42} variant="chip" />
    <Marquee items={practicesLocalized} animation="afMarqueeRev" durationSeconds={56} variant="plain" />
  </div>
</section>
```

- [ ] **Step 11: Criar `src/components/sections/Contact.astro`**

```astro
---
import { social } from '../../data/social';
import type { Locale } from '../../locales/locales';
import { useTranslations } from '../../locales/utils';
import SocialIcon from '../ui/SocialIcon.astro';

interface Props {
  locale: Locale;
}
const { locale } = Astro.props;
const t = useTranslations(locale);
---

<section id="contato" data-reveal class="border-t border-border py-[110px] pb-[120px]">
  <div data-anim="left" class="mb-7 font-mono text-[11px] uppercase tracking-[.34em] text-volt">
    06 — {t.contactLabel}
  </div>
  <h2 data-line class="mb-[30px] overflow-hidden font-display text-[clamp(38px,7.6vw,104px)] leading-[.9] tracking-[-.045em]">
    <span class="block">{t.contactTitle}</span>
  </h2>
  <p data-anim="up" class="mb-10 max-w-[560px] text-[clamp(17px,2vw,20px)] leading-[1.55] text-muted-body [text-wrap:pretty]">
    {t.contactSub}
  </p>
  <div class="flex flex-wrap items-center gap-[14px]">
    {social.map((link) => <SocialIcon link={link} />)}
    <a
      data-magnetic
      data-anim="pop"
      href="/curriculo.pdf"
      target="_blank"
      rel="noopener"
      class="flex h-[62px] items-center bg-volt px-6 font-mono text-xs uppercase tracking-[.2em] text-ink transition-colors hover:bg-ember"
    >
      {t.ctaCv}
    </a>
  </div>
</section>
```

- [ ] **Step 12: Build completo**

```bash
pnpm check
pnpm build
```

Esperado: 0 erros de tipo, build gera `dist/index.html` e `dist/en/index.html`.

- [ ] **Step 13: Verificação manual em dev — as 9 animações do inventário**

```bash
pnpm dev
```

No navegador, confirmar cada item de `spec §5`:
1. Intro wipe roda 1x ao abrir `/`; recarregar a página não repete (sessionStorage).
2. Partículas de fundo reagem ao mouse (repulsão + linhas de conexão).
3. Cursor customizado (ponto + anel) segue o mouse com atraso perceptível.
4. Barra de progresso no topo cresce ao rolar a página.
5. Links/botões com `data-magnetic` (nav, CTAs, ícones sociais, cards de projeto) se deslocam sutilmente perto do cursor.
6. Seções revelam com stagger ao rolar (hero já revela sem precisar rolar).
7. Foto "Sobre" e placeholder de projeto se movem em parallax ao rolar.
8. As duas faixas de marquee (`Stack`, práticas) rodam em direções opostas e pausam no hover.
9. Foto "Sobre" tem efeito duotone (preto e branco + overlay volt).

Trocar idioma pelo botão no header: nav/textos mudam para EN, chrome (canvas, cursor, barra de progresso) não reinicia, `data-magnetic`/`data-reveal` continuam funcionando na página nova.

- [ ] **Step 14: Commit**

```bash
git add src/components/ui/ src/components/sections/ src/assets/
git commit -m "feat: add UI components and content sections, wire full page"
```

---

### Task 12: Acessibilidade, `prefers-reduced-motion` e ativos finais

**Files:**
- Modify: nenhum arquivo novo — esta task é verificação e pequenos ajustes nos arquivos já criados

**Interfaces:**
- Nenhuma nova; task de auditoria contra `spec §11` (Global Constraints).

- [ ] **Step 1: Auditar foco de teclado**

```bash
pnpm dev
```

Navegar a página inteira só com Tab. Confirmar que todo link/botão (`nav`, CTAs, ícones sociais, cards de projeto, `LangSwitch`) mostra o outline `volt` de `:focus-visible` definido em `global.css` (Task 2) — nenhuma classe local sobrescreve `outline`.

- [ ] **Step 2: Auditar `prefers-reduced-motion: reduce`**

No DevTools do Chrome, `Rendering → Emulate CSS media feature prefers-reduced-motion: reduce`, recarregar a página. Confirmar:
- Canvas ambiente não desenha (retorno antecipado em `AmbientCanvas.tsx`, Task 9).
- Cursor customizado não aparece (retorno antecipado em `CustomCursor.tsx`, Task 9).
- As duas faixas de marquee ficam paradas (`@media (prefers-reduced-motion: reduce) { [data-marquee] { animation: none } }`, Task 2).
- Seções aparecem com fade simples, sem deslocamento (`hiddenTransform(..., true)` retorna `'none'`, Task 5).
- Foto "Sobre" e placeholder de projeto não deslocam em parallax (`bindParallax` zera o transform, Task 5).

Se algum item falhar, o bug está no respectivo arquivo do Task listado — corrigir ali, não introduzir lógica nova aqui.

- [ ] **Step 3: Confirmar `astro:assets` nas imagens**

```bash
pnpm build
```

Inspecionar `dist/_astro/` — a foto de `About.astro` deve ter sido processada (nome com hash, formato otimizado). Confirmar no HTML gerado que `<img>` tem `width`/`height` explícitos (Astro adiciona automaticamente via `astro:assets`).

- [ ] **Step 4: Registrar pendências de ativos manuais**

Confirmar que `public/og-image.jpg` e `public/curriculo.pdf` ainda não existem — isso é esperado neste ponto do plano (ver seção "Ativos que precisam ser fornecidos manualmente" no topo deste documento). Não bloquear o build por causa disso; apenas devem ser adicionados antes do deploy de produção.

- [ ] **Step 5: Commit** (só se o Step 1–2 exigiu correções; caso contrário, pular)

```bash
git add -A
git commit -m "fix: address accessibility/reduced-motion audit findings"
```

---

### Task 13: Deploy e verificação final contra os critérios de sucesso

**Files:**
- Nenhum arquivo novo — o adapter Vercel já foi configurado no Task 1 (`astro.config.ts`)

**Interfaces:**
- Nenhuma nova; task de fechamento contra `spec §13`.

- [ ] **Step 1: Confirmar a configuração de deploy**

Revisar `astro.config.ts` (Task 1): `output: 'static'`, `adapter: vercel()`. Nenhuma variável de ambiente é necessária (sem backend, sem formulário).

- [ ] **Step 2: Rodar a suíte completa uma última vez**

```bash
pnpm lint
pnpm check
pnpm test
pnpm build
```

Esperado: todos os 4 comandos terminam com exit code 0.

- [ ] **Step 3: Testar o critério "adicionar projeto = 1 arquivo"**

Criar um terceiro arquivo temporário `src/content/projects/_smoke-test.mdx`:

```mdx
---
order: 3
title:
  pt: Teste
  en: Test
description:
  pt: Projeto de teste.
  en: Test project.
stack: [Test]
link: https://example.com
---
```

```bash
pnpm dev
```

Confirmar em `/` e `/en/` que o card aparece como `03`, numerado corretamente, sem editar nenhum outro arquivo. Depois, apagar o arquivo:

```bash
rm "src/content/projects/_smoke-test.mdx"
```

Confirmar que o card some e os dois projetos restantes voltam a ser `01`/`02`.

- [ ] **Step 4: Checklist final contra `spec §13`**

- [ ] As 9 animações do inventário funcionam com os parâmetros de `§5.1` (verificado no Task 11, Step 13).
- [ ] Navegável 100% por teclado; `prefers-reduced-motion` respeitado (verificado no Task 12).
- [ ] Adicionar um projeto = 1 arquivo `.mdx`, sem outra edição (verificado neste Step 3).
- [ ] `/` (PT) e `/en/` (EN) buildam estaticamente, chrome persiste visualmente na troca de idioma (verificado no Task 11, Step 13).
- [ ] Lighthouse (build de produção, desktop) ≥ 95 em Performance/Accessibility/Best Practices/SEO — rodar manualmente via `pnpm build && pnpm preview` + Lighthouse no Chrome DevTools; não é possível automatizar isso neste plano sem um runner de CI dedicado, então fica como verificação manual final antes do deploy real.

- [ ] **Step 5: Commit final** (se houver alterações pendentes)

```bash
git add -A
git commit -m "chore: final verification pass against spec success criteria"
```

- [ ] **Step 6: Deploy**

Conectar o repositório ao Vercel (import do projeto pela UI ou `vercel link`) e confirmar que o preview deployment automático por PR funciona, conforme `spec §12`. Antes do primeiro deploy de produção, lembrar de adicionar `public/og-image.jpg` e `public/curriculo.pdf` (ver nota no topo deste plano).

---

## Self-Review

**Cobertura da spec:** todas as seções 1–15 da spec têm task correspondente — arquitetura de pastas (Task 1), tokens (Task 2), i18n/routing (Tasks 3, 8, 10), as 9 animações (Tasks 5, 9, 10, 2), content collection (Task 6), dados fixos (Task 7), a11y/qualidade (Task 12), deploy (Task 13). As duas ambiguidades da spec (`uploads/`, "Papel = modo claro") foram resolvidas: a primeira investigada e descartada antes deste plano (ver nota no topo), a segunda já não tem código associado (nenhuma task implementa light mode).

**Placeholders:** nenhum "TBD"/"implementar depois" — todo step tem código completo. As duas únicas pendências reais (`og-image.jpg`, `curriculo.pdf`) são ativos binários que um plano em texto não pode gerar; estão documentadas explicitamente como ação manual, não como placeholder de código.

**Consistência de tipos:** `Locale` (Task 3) é o único tipo de idioma usado em todos os componentes; `LocalizedText` (Task 7) é reusado por `ExperienceEntry` e `practices`; `ProjectFrontmatter`/`projectSchema` (Task 6) é a única fonte de verdade para o shape de projeto, consumida sem redefinição em `ProjectCard.astro`/`Projects.astro`. `hiddenTransform`, `magneticOffset`, `parallaxOffset` mantêm assinatura idêntica entre definição (Task 5) e uso (`reveal.ts` interno, `magnetic.ts`/`parallax.ts` DOM binders).

## Execução

Plano completo e salvo em `docs/superpowers/plans/2026-09-22-portfolio-astro-rebuild-plan.md`. Duas opções de execução:

**1. Subagent-Driven (recomendado)** — um subagente por task, revisão entre tasks, iteração rápida.

**2. Inline Execution** — execução em lote nesta sessão, com checkpoints de revisão.

Qual abordagem?
