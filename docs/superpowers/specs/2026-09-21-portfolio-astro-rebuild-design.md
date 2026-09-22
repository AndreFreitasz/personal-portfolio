# Portfolio André Freitas — Rebuild em Astro

**Data:** 2026-09-21
**Status:** Aprovado em brainstorming — pronto para plano de implementação
**Origem do design:** `design-reference/Portfolio.dc.html` e `design-reference/Identidade Visual.dc.html` (protótipos exportados do Claude Design, hoje na raiz do repo como `Portfolio.dc.html` / `Identidade Visual.dc.html`)

## 1. Contexto

O repositório contém hoje apenas o output de um protótipo do Claude Design: dois arquivos `.dc.html` (portfólio + guia de identidade visual), um `support.js` (runtime genérico do exportador, descartável), e imagens soltas. Não existe projeto Astro ainda.

Objetivo: reconstruir esse protótipo como um site de produção em Astro, preservando **exatamente** a identidade visual e as animações já validadas, trocando apenas o mecanismo de implementação (de um runtime proprietário React-in-a-single-file para uma arquitetura Astro real, tipada, com conteúdo versionado em Git).

Requisito central do usuário: **adicionar/remover um projeto do portfólio deve ser trivial** (uma operação de arquivo, não uma edição de código espalhada).

## 2. Decisões travadas no brainstorming

| Decisão | Escolha | Descartado |
|---|---|---|
| Troca de idioma (PT/EN) | Rotas nativas do Astro (`/`, `/en/`) + View Transitions API para a troca parecer suave | Toggle client-side sem URL própria; rotas sem transição |
| Modelo de conteúdo dos projetos | 1 arquivo MDX por projeto, só frontmatter (sem corpo de case study por enquanto) | Arquivo de dados central único; MDX com case study completo |
| Seção "Notas"/blog | Arquitetura deixada pronta, **collection não criada agora** | Criar já com posts de exemplo |
| Hospedagem | Vercel (`@astrojs/vercel`) | Cloudflare Pages; build agnóstico sem adapter |
| Nome da pasta de idiomas/UI strings | `src/locales/` | `src/i18n/`, `src/translations/` |

## 3. Escopo

### 3.1 Dentro do escopo (v1)
- Site one-page (PT em `/`, EN em `/en/`) com as 6 seções do protótipo: Hero, Sobre, Experiência, Projetos, Stack (marquee), Contato.
- As 9 animações/interações do protótipo, portadas fielmente (seção 5).
- Content Collection `projects` — adicionar/remover projeto = adicionar/remover 1 arquivo `.mdx`.
- Troca de idioma via rota real + View Transitions, sem perder o "sentimento" de instantaneidade no chrome persistente.
- Quality floor que o protótipo não tinha: foco de teclado visível, `prefers-reduced-motion` respeitado.

### 3.2 Fora do escopo (backlog documentado, não construir agora)
- **Modo claro.** A "Identidade Visual" nomeia `#F2EFE9` (Papel) como "texto e modo claro", mas **nenhum dos dois protótipos implementa um light mode de fato** — é só o nome da cor. Ambiguidade resolvida: v1 é single-theme escuro, como o protótipo real. Light mode fica de fora até ser pedido explicitamente.
- **Página de detalhe por projeto** (`/projetos/[slug]`). O schema da collection usa `type: 'content'` (MDX) justamente para permitir corpo de texto no futuro sem migração — mas nenhuma rota lê esse corpo em v1.
- **Collection `notes`.** Schema sugerido pra quando for ativada:
  ```ts
  // futuro — não criar agora
  defineCollection({
    type: 'content',
    schema: z.object({
      order: z.number(),
      date: z.date(),
      title: z.object({ pt: z.string(), en: z.string() }),
      tag: z.enum(['Rascunho', 'Publicado']).default('Rascunho'),
    }),
  })
  ```
- **CMS** (Sanity/Contentlayer). Git continua sendo a única fonte da verdade.
- **Formulário de contato / backend.** Contato continua sendo links diretos (redes sociais + WhatsApp + currículo), sem função serverless.
- Arquivos do exportador (`support.js`, `.thumbnail`, `uploads/`) não entram no projeto Astro — ficam arquivados em `design-reference/` ou são descartados. Verificar antes se `uploads/pasted-1789695132913-0.png` é um screenshot de projeto aproveitável (conteúdo não inspecionado nesta spec).

## 4. Design tokens

Extraídos literalmente dos dois protótipos — não são uma reinterpretação.

### 4.1 Cores

| Token | Hex | oklch (doc original) | Papel | Regra de uso |
|---|---|---|---|---|
| `ink` | `#0E0D0C` | oklch(.16 .004 60) | Fundo | Domina a composição (~70%) |
| `graphite` | `#1B1917` | — | Superfícies, cards | Separa conteúdo do fundo (~20%) |
| `graphite-2` | `#201E1B` | — | Hover de cards (ex.: experiência) | Só em estado `:hover` |
| `volt` | `#D3F24E` | oklch(.92 .18 118) | Acento 1 | Marca o que importa (~8%). **Nunca** em texto corrido nem em gradiente com `ember`. Contraste sobre `ink`: 13:1 |
| `ember` | `#FF9C7B` | oklch(.79 .12 38) | Acento 2 | Só em estados/detalhes (~2%) |
| `paper` | `#F2EFE9` | — | Texto principal | Nome "modo claro" no doc original, mas não implementado — ver §3.2 |
| `border` | `#221F1C` | — | Divisores entre seções | |
| `border-strong` | `#2A2724` | — | Bordas de card, tags | |
| `border-hover` | `#3A3733` | — | Bordas de botão/ícone em repouso | |
| `muted-label` | `#8C877E` | — | Rótulos secundários | |
| `muted-soft` | `#9A958C` | — | Texto terciário, footer | |
| `muted-body` | `#B9B4AA` | — | Parágrafos secundários | |
| `muted-bright` | `#E4E0D8` | — | Parágrafos de destaque | |

Proporção documentada no protótipo: **70% ink / 20% graphite / 8% volt / 2% ember.**

### 4.2 Tipografia

| Papel | Fonte | Uso |
|---|---|---|
| Display | `Archivo Black` | Headlines (`h1`/`h2`), sempre com `letter-spacing` negativo (-.035em a -.05em conforme tamanho) |
| Corpo | `Archivo` 400/500/600/700 | Parágrafos, 15–21px, `line-height` 1.55–1.65 |
| Label/dado | `JetBrains Mono` 400/500 | Rótulos uppercase (`letter-spacing` .18em–.34em), badges, nav, contadores |

Fontes carregadas via Google Fonts no protótipo (`Archivo+Black`, `Archivo:wght@400;500;600;700`, `JetBrains+Mono:wght@400;500`). **Decisão de implementação:** self-host em `public/fonts/` (evita round-trip externo, melhora LCP) — mesmas famílias e pesos.

### 4.3 Motion — curvas e keyframes (literais do protótipo)

```css
@keyframes afTile   { 0% { transform: scale(.55) rotate(-8deg); opacity: 0 } 55%,100% { transform: scale(1) rotate(0); opacity: 1 } }
@keyframes afLeft   { 0% { transform: translateX(-70%); opacity: 0 } 40%,100% { transform: translateX(0); opacity: 1 } }
@keyframes afRight  { 0% { transform: translateX(70%);  opacity: 0 } 40%,100% { transform: translateX(0); opacity: 1 } }
@keyframes afRule   { 0%,30% { transform: scaleX(0) } 70%,100% { transform: scaleX(1) } }
@keyframes afWipe   { 0%,68% { transform: translateY(0) } 100% { transform: translateY(-101%) } }
@keyframes afFadeUp { 0% { transform: translateY(18px); opacity: 0 } 100% { transform: translateY(0); opacity: 1 } }
@keyframes afMarquee    { from { transform: translate3d(0,0,0) }     to { transform: translate3d(-50%,0,0) } }
@keyframes afMarqueeRev { from { transform: translate3d(-50%,0,0) } to { transform: translate3d(0,0,0) } }
```

Easings usados: `cubic-bezier(.16,1,.3,1)` (entradas), `cubic-bezier(.76,0,.24,1)` (wipe/rule), `cubic-bezier(.2,1.25,.32,1)` (reveal com leve overshoot).

Timings: intro completa em `introDuration` (padrão **2400ms**, configurável 1200–4000ms) → tile/left/right 1.5s, rule 1.8s, fade-up label 0.9s com 0.5s de delay, wipe final 2.3s. Marquee de stack: 42s linear infinite. Marquee de práticas: 56s linear infinite, sentido reverso.

## 5. Inventário de animações → implementação Astro

| # | Animação | Mecânica original | Onde vive | Tipo |
|---|---|---|---|---|
| 1 | Intro wipe (monograma AF + regra + fade) | CSS keyframes + `setTimeout(dur)` | `components/sections/IntroSplash.tsx` | React island `client:load`, `transition:persist`, 1x/sessão (`sessionStorage`) |
| 2 | Canvas de partículas ambiente (216 pontos, grid espacial, repulsão do mouse) | Canvas 2D vanilla | `components/chrome/AmbientCanvas.tsx` | React island `client:load`, `transition:persist`, pausa em `prefers-reduced-motion` |
| 3 | Cursor customizado (dot + ring com lerp 0.16) | vanilla JS, off em `pointer:coarse` | `components/chrome/CustomCursor.tsx` | React island `client:load`, `transition:persist` |
| 4 | Barra de progresso de scroll | vanilla JS | `components/chrome/ScrollProgress.astro` | Script inline, sem framework |
| 5 | Hover magnético (`data-magnetic`) | listeners mousemove/mouseleave, offset ×0.18 | `components/motion/magnetic.ts` | Script compartilhado, re-bind em `astro:page-load` |
| 6 | Scroll-reveal com stagger + split-lines (`data-reveal`/`data-anim`/`data-line`) | `IntersectionObserver`, choreografia manual por direção | `components/motion/reveal.ts` | Porte ~1:1 de `showEl/hideEl/setupReveal`, mesmo contrato de atributos |
| 7 | Parallax (`data-parallax`) | listener de scroll, offset por `rect` | `components/motion/parallax.ts` | Unificado num único handler com `requestAnimationFrame` |
| 8 | Marquee duplo (stack + práticas) | `@keyframes` + `animation-play-state: paused` no hover | `components/motion/Marquee.astro` | CSS puro, zero JS |
| 9 | Duotone da foto (grayscale + `mix-blend-mode: color`) | inline styles | utilitário Tailwind (`.photo-duotone`) | CSS puro |

**Princípio de arquitetura:** nem tudo é ilha React. Só recebe JS de framework o que tem *estado* (splash, canvas, cursor). Comportamento DOM sem estado compartilhado (magnetic, reveal, parallax, progress) é TypeScript vanilla. O que é só visual (marquee, duotone) é CSS. Isso mantém o bundle de JS mínimo — o objetivo declarado de "site estático rápido que mostra React no código", não um SPA pesado.

**Gotcha de View Transitions (documentar no código):** scripts vanilla que fazem `querySelectorAll` devem re-executar no evento `astro:page-load` (disparado após cada transição do `ClientRouter`), não só em `DOMContentLoaded` — senão magnetic/reveal/parallax param de funcionar após a primeira troca de idioma.

### 5.1 Parâmetros exatos a preservar

- **Reveal:** `rootMargin: '0px 0px -40% 0px'`, `threshold: 0.05`; offsets por direção — `left`: `translate3d(-70px,14px,0) rotate(-1.6deg)`; `right`: espelhado; `down`: `translate3d(0,-44px,0)`; `pop`: `translate3d(0,26px,0) scale(.72)`; padrão (`up`): `translate3d(0,48px,0)`; `auto` alterna left/right por paridade do índice. Fallback: se o `IntersectionObserver` não decidir em 1500ms, força exibição de tudo.
- **Split-lines (`data-line`):** estado oculto `translateY(108%) rotate(3deg)` no `<span>` interno; stagger de `i*0.09 + 0.06`s.
- **Parallax:** `offset = (rect.top + rect.height/2 - innerHeight/2) * -speed`, `speed` lido do atributo (`0.04`–`0.06` no protótipo).
- **Canvas ambiente:** 216 partículas, raio 0.5–2.6px, 22% "quentes" (cor `ember`), grid de vizinhança de 130px (linhas conectam pontos a menos de 130px, alpha `0.05*(1-d/130)`), repulsão do mouse em raio 190px (força até 46px), `devicePixelRatio` limitado a 2.
- **Cursor:** dot 7px sólido `volt`; ring 32px, borda 1px `volt` a 45% alpha; interpolação `pos += (target-pos)*0.16` por frame.
- **Magnetic:** `offset = (cursor - centro) * 0.18`; retorno ao repouso com `cubic-bezier(.16,1,.3,1)` em 0.45s.

## 6. Stack técnica

| Camada | Escolha |
|---|---|
| Framework | Astro 5.x (`output: 'static'`) |
| Ilhas interativas | React 19, só onde há estado (§5) |
| Linguagem | TypeScript 5.x, `strict: true` |
| Estilo | Tailwind CSS v4 (CSS-first, tokens via `@theme` em `src/styles/global.css`, sem `tailwind.config.ts`) |
| Conteúdo | MDX via Astro Content Collections, schema validado com Zod |
| Deploy | Vercel (`@astrojs/vercel`) |
| Gerenciador de pacotes | pnpm |
| Lint/format | ESLint + Prettier |
| Testes | Vitest (utilitários de `motion/` e schema Zod) |

## 7. Arquitetura de pastas

```
personal-portfolio/
├── design-reference/               # .dc.html originais — referência, não é buildado
│   ├── Portfolio.dc.html
│   ├── Identidade Visual.dc.html
│   └── assets/andre.jpeg
├── docs/superpowers/specs/
│   └── 2026-09-21-portfolio-astro-rebuild-design.md
├── public/
│   ├── favicon.svg
│   ├── og-image.jpg
│   ├── curriculo.pdf
│   └── fonts/                      # Archivo Black, Archivo, JetBrains Mono self-hosted
├── src/
│   ├── assets/                     # imagens processadas via astro:assets
│   │   ├── andre.jpg
│   │   └── projects/*.jpg
│   ├── content/
│   │   ├── config.ts                # defineCollection + schema Zod (projects)
│   │   └── projects/
│   │       ├── savemoney.mdx
│   │       └── guysmovies.mdx
│   ├── locales/
│   │   ├── locales.ts               # ['pt','en'], default 'pt'
│   │   ├── ui.ts                    # dicionário tipado: nav, hero, about, contact...
│   │   └── utils.ts                 # useTranslations(), getAlternateUrl()
│   ├── layouts/
│   │   └── BaseLayout.astro         # <html>, fontes, meta/OG, <ClientRouter/>
│   ├── components/
│   │   ├── chrome/                  # persiste entre transições (transition:persist)
│   │   │   ├── AmbientCanvas.tsx
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── ScrollProgress.astro
│   │   │   ├── Header.astro
│   │   │   └── LangSwitch.astro
│   │   ├── motion/                  # contrato de animação compartilhado
│   │   │   ├── reveal.ts
│   │   │   ├── magnetic.ts
│   │   │   ├── parallax.ts
│   │   │   └── Marquee.astro
│   │   ├── sections/
│   │   │   ├── IntroSplash.tsx
│   │   │   ├── Hero.astro
│   │   │   ├── About.astro
│   │   │   ├── Experience.astro
│   │   │   ├── Projects.astro       # getCollection('projects')
│   │   │   ├── ProjectCard.astro
│   │   │   ├── StackMarquee.astro
│   │   │   └── Contact.astro
│   │   └── ui/
│   │       ├── SectionLabel.astro   # "01 —" + heading com data-line (dedup de 4 seções)
│   │       ├── SocialIcon.astro
│   │       └── Tag.astro
│   ├── data/                        # listas pequenas de forma fixa (não são coleções)
│   │   ├── experience.ts
│   │   ├── stack.ts
│   │   └── social.ts
│   ├── styles/
│   │   └── global.css               # @theme (tokens) + keyframes
│   ├── lib/
│   │   └── types.ts
│   └── pages/
│       ├── index.astro              # PT — locale padrão, sem prefixo
│       └── en/
│           └── index.astro
├── astro.config.ts
├── package.json
└── tsconfig.json
```

**`content/` vs `data/`:** `content/projects/*.mdx` é para itens que crescem/encolhem independentemente — o requisito de "fácil adicionar/remover". `data/*.ts` é para listas pequenas de forma fixa (timeline de experiência, lista de stack, links sociais) editadas como um todo, sem precisar de schema de coleção nem de um arquivo por item.

## 8. Modelo de conteúdo

### 8.1 Projetos (`src/content/config.ts`)

```ts
import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  type: 'content', // MDX — corpo vazio hoje; permite virar case study depois sem migração
  schema: ({ image }) => z.object({
    order: z.number(),
    year: z.string().optional(),
    title: z.object({ pt: z.string(), en: z.string() }),
    description: z.object({ pt: z.string(), en: z.string() }),
    stack: z.array(z.string()),
    link: z.string().url(),
    repo: z.string().url().optional(),
    image: image().optional(), // ausente => cai no placeholder listrado do protótipo
  }),
});

export const collections = { projects };
```

Um arquivo por projeto — **não** um arquivo por idioma. PT/EN vivem como campos do mesmo frontmatter. Adicionar/remover projeto continua sendo criar/apagar 1 arquivo, independente do número de idiomas.

O número do card (`01`, `02`...) exibido na UI é **derivado da posição** no array ordenado por `order`, nunca hardcoded — corrige um footgun do protótipo original (lá, apagar o projeto 01 deixaria o antigo 02 exibindo "02" errado).

### 8.2 Dados fixos (`src/data/`)

`experience.ts`, `stack.ts`, `social.ts` — arrays tipados com campos `{ pt, en }` onde houver texto, mesma forma do dict original, sem passar por Content Collections (não há caso de uso de "adicionar 1 arquivo = 1 emprego novo").

### 8.3 Textos de interface (`src/locales/ui.ts`)

Textos curtos que não pertencem a um item de conteúdo específico: rótulos de nav, textos de botão, parágrafo do hero, labels de seção. **Copy definitivo (PT/EN) é o já existente em `design-reference/Portfolio.dc.html` linhas 220–284 — usar verbatim, não reescrever.**

## 9. i18n, routing e View Transitions

- `astro.config.ts`: `i18n: { defaultLocale: 'pt', locales: ['pt','en'], routing: { prefixDefaultLocale: false } }` → `/` = PT, `/en/` = EN.
- `BaseLayout.astro` inclui `<ClientRouter />` (API de View Transitions do Astro) uma única vez.
- Chrome independente de idioma (`AmbientCanvas`, `CustomCursor`, `ScrollProgress`, monograma AF) recebe `transition:persist` — não reinicia ao trocar idioma.
- Conteúdo textual troca via cross-fade padrão do Astro — a própria mudança de texto já comunica "idioma trocou", sem necessidade de efeito extra.
- `LangSwitch.astro` calcula a URL irmã (mesma página, outro prefixo) e navega por `<a>` normal; o `ClientRouter` intercepta automaticamente.

## 10. Fluxo

**Build-time:**
```
content/projects/*.mdx ─┐
data/*.ts ───────────────┼─► Zod valida ─► getCollection()/import ─► Astro gera
locales/ui.ts ───────────┘        HTML estático para cada rota (pt, en)
```

**Runtime — primeira carga:**
```
HTML+CSS chegam prontos (SSG)
  → IntroSplash hidrata (client:load) → roda wipe → some, marca sessionStorage
  → AmbientCanvas + CustomCursor hidratam em paralelo
  → reveal.ts / magnetic.ts / parallax.ts rodam (vanilla, não esperam hidratação)
  → scroll do usuário aciona reveal + progress + parallax (1 handler, rAF)
```

**Runtime — troca de idioma:**
```
clique em LangSwitch → ClientRouter navega sem reload
  → chrome com transition:persist continua rodando sem reiniciar
  → nova página monta → evento astro:page-load dispara
  → reveal/magnetic/parallax re-bindam nos novos nós do DOM
  → IntroSplash NÃO roda de novo (sessionStorage + persist)
```

## 11. Acessibilidade e qualidade (piso não negociável)

Itens que o protótipo **não** tinha e este rebuild adiciona sem alterar a estética:

- `:focus-visible` com outline `volt` em todo elemento interativo (o protótipo só define `:hover`).
- `prefers-reduced-motion: reduce` pausa canvas/cursor/marquee/parallax e troca o scroll-reveal por um fade simples sem deslocamento.
- Imagens de projeto via `astro:assets` (AVIF/WebP automático, `width`/`height` explícitos).
- Fontes self-hosted (sem round-trip a fonts.googleapis.com).
- Cursor customizado e ring continuam desabilitados em `pointer: coarse` (já existia, preservado).

## 12. Deploy

`@astrojs/vercel`, `output: 'static'`. Site 100% estático — não há formulário/backend, então nenhuma função serverless é necessária. Preview deployment automático por PR (padrão Vercel + GitHub).

## 13. Critérios de sucesso

- As 9 animações do inventário (§5) funcionando com os parâmetros de §5.1 preservados.
- Lighthouse (build de produção, desktop): Performance/Accessibility/Best Practices/SEO ≥ 95.
- Navegável 100% por teclado; `prefers-reduced-motion` respeitado.
- Adicionar um projeto = criar 1 arquivo `.mdx` em `src/content/projects/`; nenhuma outra edição necessária para ele aparecer na grid, numerado corretamente, nos dois idiomas.
- `/` (PT) e `/en/` buildam estaticamente, com o mesmo conteúdo de chrome persistindo visualmente na troca.

## 14. Riscos e ambiguidades resolvidas nesta spec

- **"Papel = modo claro" no doc de identidade** não corresponde a uma implementação real → tratado como nome de cor, não como feature. Ver §3.2.
- **`uploads/pasted-1789695132913-0.png`** tem conteúdo não inspecionado nesta spec — checar na implementação se é um screenshot de projeto aproveitável antes de descartar.
- **Duplicação de idioma nos projetos**: resolvida optando por campos `{pt, en}` dentro do mesmo arquivo MDX em vez de um arquivo por idioma (mantém "1 arquivo = 1 projeto" verdadeiro independente do número de idiomas).

## 15. Próximos passos

Acionar a skill `writing-plans` para transformar esta spec num plano de implementação passo a passo (setup do projeto → tokens/estilo → layout base + i18n/routing → chrome persistente e ilhas → seções de conteúdo → content collection de projetos → qualidade/a11y → deploy).
