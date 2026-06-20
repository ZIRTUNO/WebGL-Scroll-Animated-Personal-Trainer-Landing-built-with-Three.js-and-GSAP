<div align="center">

# Diego Santos — Landing Page de Alta Performance

Landing page imersiva de página única para o personal trainer **Diego Santos**, com um **halter 3D animado pelo scroll**, microinterações refinadas e foco em performance, acessibilidade e SEO.

[![Three.js](https://img.shields.io/badge/Three.js-r160-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![GSAP](https://img.shields.io/badge/GSAP-3.12.5-88CE02?logo=greensock&logoColor=white)](https://gsap.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=000)](#)
[![HTML5](https://img.shields.io/badge/HTML5-sem%20build-E34F26?logo=html5&logoColor=white)](#)
[![CSS3](https://img.shields.io/badge/CSS3-modular-1572B6?logo=css3&logoColor=white)](#)
[![WebGL](https://img.shields.io/badge/WebGL-3D-990000?logo=webgl&logoColor=white)](#)

</div>

---

## Índice

- [Visão geral](#visão-geral)
- [Demonstração](#demonstração)
- [Principais recursos](#principais-recursos)
- [Tecnologias e dependências](#tecnologias-e-dependências)
- [A animação 3D do halter](#a-animação-3d-do-halter)
- [Sistema de rolagem e animações](#sistema-de-rolagem-e-animações)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura JavaScript](#arquitetura-javascript)
- [Arquitetura CSS](#arquitetura-css)
- [Acessibilidade](#acessibilidade)
- [SEO e performance](#seo-e-performance)
- [Como executar localmente](#como-executar-localmente)
- [Testes](#testes)
- [Otimização de assets](#otimização-de-assets)
- [Compatibilidade de navegadores](#compatibilidade-de-navegadores)
- [Equipe e responsáveis](#equipe-e-responsáveis)
- [Créditos e licenças](#créditos-e-licenças)

---

## Visão geral

Site institucional de página única (one-page) para apresentar o trabalho do personal trainer **Diego Santos**: método de treino, serviços, resultados e canais de contato (com CTAs diretas para o WhatsApp).

O grande diferencial técnico é a experiência visual: um **modelo 3D de halter** entra na cena no topo (hero), **gira e percorre uma trajetória conforme o usuário rola a página**, encolhe e "ancora" (dock) ao lado do título da seção *História*. Toda a interface é construída em **HTML, CSS e JavaScript puros (vanilla)**, **sem framework e sem etapa de build** — as bibliotecas externas são carregadas por CDN.

Princípios que guiam o projeto:

- **Sem build, sem bundler.** O navegador carrega ES Modules nativos via `<script type="module">` e um `importmap`.
- **CSS modular.** Um único `main.css` importa ~23 folhas de estilo, uma por componente/seção.
- **JavaScript modular e desacoplado.** Cada efeito vive em seu próprio módulo, orquestrado por `js/main.js`.
- **Performance em primeiro lugar.** DPR limitado, render do WebGL sob demanda, animações com `will-change`/`transform`, e cuidados específicos para mobile (zoom seguro, ruído da barra de URL do iOS, etc.).
- **Degradação graciosa.** Se o GSAP não carregar ou o usuário preferir menos movimento (`prefers-reduced-motion`), o conteúdo aparece estático e legível.

---

## Demonstração

> 📸 _Adicione aqui um screenshot ou GIF da página em ação (sugestão: `assets/preview.png` ou `assets/preview.gif`)._

```
[ hero com halter 3D ]  →  scroll  →  [ halter girando pela trilha ]  →  [ dock na seção História ]
```

---

## Principais recursos

| Recurso | Descrição |
|---|---|
| 🏋️ **Halter 3D dirigido pelo scroll** | Modelo glTF renderizado com Three.js que percorre uma trajetória Catmull-Rom em sincronia com a rolagem. |
| 🎬 **Intro/preloader** | Overlay de carregamento com barra de progresso baseada em imagens, fontes e prontidão do 3D. |
| ✨ **Reveals on-scroll** | Seções, títulos (divididos por linha), cards, métricas e depoimentos surgem com GSAP ScrollTrigger. |
| 🔢 **Contadores animados** | Números do hero e das métricas fazem _count-up_ ao entrar na viewport (e re-disparam ao voltar). |
| 🧲 **Botões magnéticos** | CTAs primárias seguem levemente o cursor (apenas ponteiro fino/desktop). |
| 🃏 **Cards com tilt 3D** | Cards de serviços/resultados inclinam e ganham brilho de acordo com o mouse. |
| 🧭 **Navegação inteligente** | Scrollspy no menu + trilho lateral de pontos + scroll suave nativo para as âncoras. |
| 📱 **Menu mobile** | Overlay full-screen acessível; o hambúrguer se transforma no "X" de fechar. |
| ❓ **FAQ acordeão** | Acessível por teclado (setas, Home/End, Enter/Espaço) com animação de altura. |
| 💬 **FAB do WhatsApp** | Botão flutuante que só aparece quando não há risco de cobrir as CTAs do hero. |
| 🛡️ **Proteção de conteúdo** | Bloqueio de menu de contexto, cópia, arraste de imagens e atalhos de devtools (dissuasivo). |
| ♿ **Acessibilidade** | Skip-link, `aria-*`, foco gerenciado por modalidade (teclado vs. toque) e suporte a movimento reduzido. |

---

## Tecnologias e dependências

**Núcleo:** HTML5 semântico, CSS3 modular e JavaScript (ES Modules), **sem framework e sem build**.

**Bibliotecas externas (via CDN, sem `node_modules`):**

| Biblioteca | Versão | Uso | Como é carregada |
|---|---|---|---|
| [Three.js](https://threejs.org/) | `r160` | Renderização WebGL do halter 3D | ESM + `importmap` (unpkg) |
| Three.js addons | `r160` | `GLTFLoader`, `RoomEnvironment`, `PMREMGenerator` | ESM (`three/addons/`) |
| [GSAP](https://gsap.com/) | `3.12.5` | Animações e tweens | `<script>` (unpkg) |
| GSAP **ScrollTrigger** | `3.12.5` | Animações dirigidas pelo scroll | `<script>` (unpkg) |
| GSAP **Flip** | `3.12.5` | Transições de layout (registrado se disponível) | `<script>` (unpkg) |
| [Google Fonts](https://fonts.google.com/) | — | Tipografia **Exo 2** + **Montserrat** | `<link>` |

**Modelo 3D:** "Dumbbells" por **donnichols** (Sketchfab), licença **CC-BY-4.0** — veja [Créditos e licenças](#créditos-e-licenças).

---

## A animação 3D do halter

O coração do projeto. Implementado em [`js/dumbbell-3d.js`](js/dumbbell-3d.js) (cena/renderer/loop) e [`js/dumbbell-path.mjs`](js/dumbbell-path.mjs) (matemática pura, testável em Node).

**Pipeline de renderização (Three.js):**
- `WebGLRenderer` com `alpha`, `antialias`, `ACESFilmicToneMapping` e `SRGBColorSpace`.
- Iluminação em três pontos (key/fill/rim) + `AmbientLight`.
- **Ambiente PMREM** gerado a partir de `RoomEnvironment` — essencial porque o halter é metálico e, sem reflexos de ambiente, renderizaria quase preto. O custo é pago uma vez, durante a janela de download do modelo.
- `GLTFLoader` carrega `assets/models/dumbbell/scene.gltf`. O material é ajustado (metalness/roughness/anisotropia) para um acabamento consistente.

**Limpeza do modelo:** o glTF original vem com meshes duplicadas (dois halteres). Duas heurísticas removem as cópias em tempo de execução: `stripDuplicateByName` (sufixos `.001`, `.002`…) e `stripDuplicateByCentroidGap` (separa por maior lacuna entre centróides nos eixos X/Y/Z).

**Trajetória e pose:**
- A trilha é uma **spline Catmull-Rom** com seis pontos-chave (`buildDumbbellPath`), nomeados por fases do título (`suba`, `proximo`, `patamar`, `image`).
- A pose (posição + rotação) por progresso é calculada em `getDumbbellPose`, com easing `easeInOutCubic`, giro no eixo Y e tombamento no Z até travar na vertical (`FINAL_SCREEN_ROTATION_Z`).
- O loop usa **objetos pré-alocados** (sem alocação por frame) para não pressionar o garbage collector a 60fps.

**Acoplamento ao scroll e "dock":**
- **Não usa um segundo timeline do ScrollTrigger.** O progresso vem diretamente do scroll nativo da página (`getPageScrollY`), normalizado entre o topo do hero e o ponto de ancoragem.
- Âncoras de início/fim são medidas em coordenadas de layout (`offsetParent`), independentes das transforms de reveal, e recalculadas **apenas em mudanças reais de viewport** (resize, orientação, fontes, zoom) — nunca durante o scroll.
- Ao chegar ao fim, o halter **"ancora" (dock)** ao marcador `.story-dumbbell-dock` na seção *História*, seguindo o ponto no documento em coordenadas de mundo (histerese de attach/hold para não "pular" em micro-scroll reverso).

**Responsividade e robustez mobile:**
- Presets distintos para **mobile / tablet / desktop** (escala, trajetória, profundidade de câmera).
- **DPR limitado** por faixa (1.35 mobile / 1.5 tablet / 2 desktop) para evitar travamentos no Safari.
- **Modo seguro de zoom mobile:** gestos de pinça (`gesturestart`, `touchmove` multi-touch) pausam o WebGL e removem o stage do compositing.
- **Ruído da barra de URL do iOS** é detectado e ignorado para o halter não "teleportar" no meio do scroll.
- Compensação de **zoom de navegador** (desktop) baseada em `outerWidth/innerWidth`.
- Recuperação de `webglcontextlost` / `webglcontextrestored`.

---

## Sistema de rolagem e animações

A "tecnologia de rolagem" do site é uma combinação de **GSAP ScrollTrigger** com um sincronizador de **scroll nativo** próprio — **não há lib de scroll suave** (o antigo Lenis foi removido; há testes que garantem isso).

- **[`js/scroll-sync.js`](js/scroll-sync.js)** — ouve o scroll nativo e mantém o `ScrollTrigger` atualizado (`update`/`refresh`), com _pumps_ para casos especiais (auto-scroll do botão do meio, arraste da barra de rolagem) e refresh de viewport guardado por "assinatura" (só recalcula se largura/altura/zoom realmente mudou). Expõe também `smoothScrollTo` (respeitando `prefers-reduced-motion`).
- **[`js/scroll-fx.js`](js/scroll-fx.js)** — reveals de seções, **divisão de títulos em linhas** com revelação escalonada, `ScrollTrigger.batch` para cards/steps/serviços/depoimentos/métricas, **count-ups** numéricos e animação das linhas da CTA final.
- **[`js/navigation.js`](js/navigation.js)** + **[`js/scroll-rail.js`](js/scroll-rail.js)** — scrollspy do menu e do trilho lateral de pontos, via posição de scroll (não IntersectionObserver), sincronizados por um evento `site:active-section`.
- **[`js/magnetic-buttons.js`](js/magnetic-buttons.js)** e **[`js/card-fx.js`](js/card-fx.js)** — microinterações de cursor (somente ponteiro fino).

Todos os módulos respeitam `prefers-reduced-motion` e o site permanece totalmente funcional se o GSAP não carregar em ~2,5s (timeout de `awaitGsap`).

---

## Estrutura de pastas

```text
Landing-Page-Personal/
├── index.html                 # Marcação semântica + importmap + carregamento das libs
├── css/
│   ├── main.css               # Agregador: @import de todas as folhas abaixo
│   ├── base.css               # Reset, variáveis, tipografia, skip-link
│   ├── layout.css             # Container e grid global
│   ├── intro.css              # Preloader / overlay de carregamento
│   ├── nav.css                # Barra de navegação + hambúrguer
│   ├── nav-overlay.css        # Menu mobile full-screen
│   ├── buttons.css            # CTAs (pílulas com gradiente isolado)
│   ├── fab.css                # Botão flutuante do WhatsApp
│   ├── hero.css               # Seção topo (hero) e camadas de z-index
│   ├── dumbbell-stage.css     # Canvas/stage do WebGL
│   ├── ticker.css             # Marquee/esteira de palavras
│   ├── story.css              # Seção História (+ marcador de dock)
│   ├── method.css             # Seção Método
│   ├── services.css           # Seção Serviços
│   ├── metrics.css            # Faixa de métricas
│   ├── results.css            # Depoimentos e galeria
│   ├── faq.css                # Acordeão de perguntas
│   ├── final-cta.css          # Chamada final
│   ├── footer.css             # Rodapé
│   ├── scroll-rail.css        # Trilho lateral de pontos
│   ├── animations.css         # Keyframes (gradientes, etc.)
│   ├── card-fx.css            # Efeito de tilt/brilho dos cards
│   └── mobile-perf.css        # Ajustes de performance em mobile
├── js/
│   ├── main.js                # Orquestrador (boot sequence)
│   ├── intro.js               # Preloader e fade-out
│   ├── protection.js          # Proteção de conteúdo (dissuasiva)
│   ├── focus-modality.js      # Foco por modalidade (teclado vs. ponteiro)
│   ├── navigation.js          # Scrollspy + scroll suave para âncoras
│   ├── scroll-sync.js         # Sincronização de scroll nativo ↔ ScrollTrigger
│   ├── scroll-fx.js           # Reveals, split de títulos, count-ups
│   ├── magnetic-buttons.js    # Botões magnéticos
│   ├── card-fx.js             # Tilt 3D dos cards
│   ├── scroll-rail.js         # Trilho lateral de pontos
│   ├── nav-menu.js            # Menu mobile (overlay/hambúrguer)
│   ├── faq.js                 # Acordeão acessível
│   ├── floating-fab.js        # Visibilidade do FAB do WhatsApp
│   ├── dumbbell-3d.js         # Cena Three.js + loop de render
│   └── dumbbell-path.mjs      # Trajetória/pose (matemática pura, testável)
├── assets/
│   ├── *.png                  # Fotos do Diego e logos (DS)
│   └── models/dumbbell/       # Modelo glTF + texturas + license.txt
└── tests/
    ├── dumbbell-path.test.mjs # Testes da trajetória/pose (Node, sem deps)
    └── site-audit.test.mjs    # Auditoria de HTML/CSS/JS, SEO e regras
```

---

## Arquitetura JavaScript

O ponto de entrada é [`js/main.js`](js/main.js), que define a **ordem de boot**:

1. `initIntro()`, `initProtection()`, `initFocusModality()`, `initSectionNavigation()` — independem do GSAP.
2. `awaitGsap()` aguarda `gsap`, `ScrollTrigger` e `Flip` (timeout de 2,5s).
3. Se o GSAP carregou: `initNativeScrollSync()`, `initScrollFx()`, `initMagneticButtons()`.
4. Sempre: `initCardFx()`, `initFaq()`, `initScrollRail()`, `initNavMenu()`, `initFloatingFab()`, `initDumbbell3D()`.

Cada módulo exporta uma única função `init*()`, é defensivo (sai cedo se o elemento-alvo não existe) e respeita `prefers-reduced-motion`.

---

## Arquitetura CSS

- Um único arquivo de entrada, **[`css/main.css`](css/main.css)**, faz `@import` de todas as folhas (uma por componente/seção).
- Estilos críticos do preloader são **inlined** no `<head>` para pintar no primeiro frame.
- Padrão recorrente: gradientes pintados em **camadas internas isoladas** (`::before`) para não vazar artefatos em elementos transformados (botões, ícones, avatares) — comportamento coberto por testes.

---

## Acessibilidade

- `lang="pt-BR"`, único `<h1>`, marcação semântica (`<nav>`, `<main>`, `<section>`, `<footer>`).
- **Skip-link** ("Pular para o conteúdo") que só aparece em navegação real por teclado.
- **Modalidade de foco** ([`focus-modality.js`](js/focus-modality.js)): foco visível ativado por `Tab`; toque/scroll/ponteiro limpam o estado para não vazar contornos em mobile.
- FAQ navegável por teclado; menu mobile com `role="dialog"`, `aria-modal`, _focus trap_ e `Esc`.
- `aria-current` no item de navegação ativo; imagens com `alt` e `width`/`height`.
- Suporte completo a `prefers-reduced-motion`.

> **Nota:** o módulo `protection.js` bloqueia menu de contexto, cópia, arraste de imagens e atalhos de devtools. É um **dissuasor**, não uma medida de segurança real (todo o código roda no cliente), e pode reduzir a usabilidade para alguns usuários — mantenha-o consciente desse trade-off.

---

## SEO e performance

- Meta tags de **descrição**, **canonical**, **Open Graph** e **Twitter Card**.
- **JSON-LD** (`schema.org/Person`) descrevendo o profissional.
- `preconnect`/`preload` das fontes e da imagem principal do hero; `fetchpriority="high"`.
- Imagens com `loading="lazy"`/`decoding="async"` fora do hero.
- WebGL otimizado: DPR limitado, render sob demanda, `will-change`/`transform`, contain/clip em elementos pesados.

---

## Como executar localmente

> ⚠️ **Importante:** por usar **ES Modules + `importmap`**, o site **precisa ser servido por HTTP**. Abrir o `index.html` direto pelo `file://` **não funciona** (módulos são bloqueados por CORS).

Não há etapa de instalação (`npm install`) — não existe `package.json` nem `node_modules`. Basta servir a pasta raiz com qualquer servidor estático:

**Opção 1 — Python:**
```bash
python -m http.server 5173
# → http://localhost:5173
```

**Opção 2 — Node:**
```bash
npx serve .
# ou
npx http-server -p 5173
```

**Opção 3 — VS Code:** extensão **Live Server** → "Open with Live Server".

Depois, acesse `http://localhost:5173` no navegador.

---

## Testes

Os testes usam **apenas built-ins do Node** (`node:assert`, `node:fs`) — sem dependências. Execute a partir da **raiz do repositório**:

```bash
# Testes da trajetória/pose do halter (matemática pura)
node tests/dumbbell-path.test.mjs

# Auditoria do site: SEO, acessibilidade, links, regras de CSS/JS
node tests/site-audit.test.mjs
```

- **`dumbbell-path.test.mjs`** valida escalas responsivas, âncoras de início/dock, rotação final e formato da trajetória.
- **`site-audit.test.mjs`** lê os arquivos reais e garante invariantes do projeto (idioma, único `<h1>`, meta tags/OG/JSON-LD, links de WhatsApp/Instagram com `rel` correto, ausência de Lenis, regras de gradiente isolado, comportamento do halter, etc.).

---

## Otimização de assets

As fotos (`assets/*.png`, ~2 MB cada) e o modelo glTF (~8,8 MB) são os ativos mais pesados. Sugestões de melhoria contínua:

- Converter as fotos para **WebP/AVIF** e servir tamanhos responsivos (`srcset`).
- Compactar/otimizar as texturas do modelo e avaliar **Draco/meshopt** para o glTF.

---

## Compatibilidade de navegadores

Requer um navegador moderno com suporte a **WebGL**, **ES Modules** e **`importmap`**:

- Chrome/Edge **89+**
- Firefox **108+**
- Safari **16.4+**

Sem esse suporte, as bibliotecas via `importmap` não carregam (o conteúdo HTML ainda é exibido, mas sem o 3D).

---

## Equipe e responsáveis

| Papel | Responsável |
|---|---|
| **Desenvolvimento / proprietário** | Pedro Paiva Mautone Campos — [@Pedrowtst](https://github.com/Pedrowtst) |
| **Desenvolvimento / proprietário** | Jonathan Delmonte — [@JonathanDelmonte](https://github.com/JonathanDelmonte) |
| **Cliente / profissional retratado** | Diego Santos — Personal Trainer |

---

## Créditos e licenças

**Modelo 3D — atribuição obrigatória (CC-BY-4.0):**

> This work is based on ["Dumbbells"](https://sketchfab.com/3d-models/dumbbells-5326aeb5db89468681f4c2557052e65a) by [donnichols](https://sketchfab.com/donnichols) licensed under [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/).

**Bibliotecas:** [Three.js](https://github.com/mrdoob/three.js) (MIT) · [GSAP](https://gsap.com/community/standard-license/) (licença padrão GreenSock) · Fontes **Exo 2** e **Montserrat** via Google Fonts (SIL OFL).

**Código e conteúdo do site:** © 2026 Diego Santos. Todos os direitos reservados. _(Defina aqui a licença do código-fonte, caso deseje torná-lo aberto — ex.: MIT.)_
