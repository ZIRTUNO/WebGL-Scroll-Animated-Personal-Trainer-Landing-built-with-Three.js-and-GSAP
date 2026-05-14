import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const visibleHtml = html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, '');
const mainCss = fs.readFileSync('css/main.css', 'utf8');
const navCss = fs.readFileSync('css/nav.css', 'utf8');
const buttonsCss = fs.readFileSync('css/buttons.css', 'utf8');
const heroCss = fs.readFileSync('css/hero.css', 'utf8');
const stageCss = fs.readFileSync('css/dumbbell-stage.css', 'utf8');
const scrollFx = fs.readFileSync('js/scroll-fx.js', 'utf8');
const scrollSmootherJs = fs.readFileSync('js/scroll-smoother.js', 'utf8');
const mainJs = fs.readFileSync('js/main.js', 'utf8');
const cardFxJs = fs.readFileSync('js/card-fx.js', 'utf8');
const cardFxCss = fs.readFileSync('css/card-fx.css', 'utf8');
const scrollRailJs = fs.readFileSync('js/scroll-rail.js', 'utf8');
const navigationJs = fs.readFileSync('js/navigation.js', 'utf8');
const animationsCss = fs.readFileSync('css/animations.css', 'utf8');

const CANONICAL_URL = 'https://diegosantos.fit/';
const WHATSAPP_URL = 'https://wa.me/557592022059?text=';
const INSTAGRAM_URL = 'https://www.instagram.com/santos__diegooo/';

function attr(source, name) {
  return source.match(new RegExp(`${name}="([^"]*)"`, 'i'))?.[1] || '';
}

function anchors() {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    attrs: match[1],
    href: attr(match[1], 'href'),
    target: attr(match[1], 'target'),
    rel: attr(match[1], 'rel'),
    text: match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  }));
}

function imgs() {
  return [...html.matchAll(/<img\b([^>]*)>/gi)].map((match) => ({
    attrs: match[1],
    src: attr(match[1], 'src'),
    alt: attr(match[1], 'alt'),
    width: attr(match[1], 'width'),
    height: attr(match[1], 'height'),
  }));
}

function navBlock() {
  return html.match(/<nav\b[^>]*class="nav"[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
}

function zIndexFor(selector, css) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = css.match(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, 'm'))?.[1] || '';
  const z = block.match(/z-index:\s*(-?\d+)/)?.[1];
  return z ? Number(z) : null;
}

assert.match(html, /<html\s+lang="pt-BR"/i, 'document language is Brazilian Portuguese');
assert.equal((html.match(/<h1\b/gi) || []).length, 1, 'site keeps a single H1');
assert.match(html, /<meta\b(?=[^>]*name="description")[^>]*content="[^"]{80,180}"[^>]*>/i, 'meta description is present and concise');
assert.match(html, new RegExp(`<link\\s+rel="canonical"\\s+href="${CANONICAL_URL}"\\s*/?>`, 'i'), 'canonical URL is present');
assert.match(html, /<meta\b(?=[^>]*property="og:title")[^>]*content="[^"]+"[^>]*>/i, 'Open Graph title is present');
assert.match(html, /<meta\b(?=[^>]*property="og:description")[^>]*content="[^"]+"[^>]*>/i, 'Open Graph description is present');
assert.match(html, /<meta\b(?=[^>]*property="og:type")[^>]*content="website"[^>]*>/i, 'Open Graph type is website');
assert.match(html, new RegExp(`<meta\\b(?=[^>]*property="og:url")[^>]*content="${CANONICAL_URL}"[^>]*>`, 'i'), 'Open Graph URL is canonical');
assert.match(html, /<meta\b(?=[^>]*property="og:image")[^>]*content="[^"]+"[^>]*>/i, 'Open Graph image is present');
assert.match(html, /<meta\b(?=[^>]*name="twitter:card")[^>]*content="summary_large_image"[^>]*>/i, 'Twitter card is present');
assert.match(html, /<link\s+rel="icon"\s+[^>]*href="assets\/logo-mark\.png"/i, 'favicon is configured');
assert.ok(fs.existsSync('assets/logo-mark.png'), 'replacement DS logo asset exists');
assert.doesNotMatch(html, /width="1254"\s+height="1254"/, 'old logo dimensions are not used');
assert.match(navCss, /\.nav \.brand img\s*\{[\s\S]*clamp\(42px,\s*3\.2vw,\s*50px\)[\s\S]*object-fit:\s*cover/, 'navbar logo is visibly sized and responsive');
assert.match(fs.readFileSync('css/footer.css', 'utf8'), /\.footer-logo img\s*\{[\s\S]*clamp\(54px,\s*4\.4vw,\s*64px\)[\s\S]*object-fit:\s*contain/, 'footer logo is visibly sized and responsive');
assert.match(html, /<script\s+type="application\/ld\+json">[\s\S]*"@type":\s*"Person"[\s\S]*<\/script>/i, 'Person JSON-LD is present');
assert.doesNotMatch(visibleHtml, /---|—|–|â€”|â€“/, 'visible copy avoids dash separators and mojibake dash artifacts');

const allAnchors = anchors();
assert.deepEqual(
  allAnchors.filter((link) => !link.href || link.href === '#').map((link) => link.text),
  [],
  'no empty or placeholder anchor hrefs remain',
);
assert.deepEqual(
  allAnchors.filter((link) => link.href === '#contato').map((link) => link.text),
  [],
  'sales CTAs no longer route to the local contact placeholder',
);

const whatsappLinks = allAnchors.filter((link) => link.href.startsWith(WHATSAPP_URL));
assert.ok(whatsappLinks.length >= 9, 'all action CTAs route to WhatsApp with context');
for (const link of whatsappLinks) {
  assert.equal(link.target, '_blank', `${link.text} opens WhatsApp in a new tab`);
  assert.match(link.rel, /\bnoopener\b/, `${link.text} includes noopener`);
  assert.match(link.rel, /\bnoreferrer\b/, `${link.text} includes noreferrer`);
  assert.ok(new URL(link.href).searchParams.get('text')?.startsWith('Olá, Diego!'), `${link.text} has a Portuguese message`);
}

const instagram = allAnchors.find((link) => link.href === INSTAGRAM_URL);
assert.ok(instagram, 'Instagram link points to the provided profile');
assert.equal(instagram.target, '_blank', 'Instagram opens in a new tab');
assert.match(instagram.rel, /\bnoopener\b/, 'Instagram includes noopener');
assert.match(instagram.rel, /\bnoreferrer\b/, 'Instagram includes noreferrer');
assert.ok(
  allAnchors.some((link) => link.href === 'tel:+557592022059' || link.href.startsWith(WHATSAPP_URL)),
  'direct contact links use the provided phone number',
);

for (const image of imgs()) {
  assert.ok(image.alt.trim(), `${image.src} has alt text`);
  assert.ok(image.width && image.height, `${image.src} has width and height attributes`);
}

const sectionNums = [...html.matchAll(/<div class="sec-num">(\d{2})<em>([\s\S]*?)<\/em><\/div>/gi)];
assert.deepEqual(
  sectionNums.map((section) => section[1]),
  ['01', '02', '03', '04', '05'],
  'remaining numbered sections are renumbered after removing sections 02 and 06',
);
assert.doesNotMatch(html, /class="sec philo"|class="sec process"|process-list/i, 'removed sections 02 and 06 are not present in the DOM');
assert.doesNotMatch(mainCss, /philosophy\.css|process\.css/i, 'removed sections do not keep stylesheet imports');
assert.doesNotMatch(scrollFx, /\.pitem|\.philo/i, 'removed sections do not keep scroll animation hooks');

const primaryNavHrefs = [...navBlock().matchAll(/<li><a href="([^"]+)"/gi)].map((match) => match[1]);
assert.deepEqual(
  primaryNavHrefs,
  ['#historia', '#metodo', '#servicos', '#resultados', '#faq'],
  'primary nav keeps the visible tab order from the visual references',
);
for (const href of primaryNavHrefs) {
  assert.match(html, new RegExp(`id="${href.slice(1)}"`), `${href} points to an existing section`);
}
assert.match(mainJs, /initSectionNavigation/, 'section navigation module is booted');
assert.match(mainJs, /initCardFx/, 'interactive card effect module is booted');
assert.doesNotMatch(html, />\s*SCROLL\s*</i, 'scroll rail text label is removed');
assert.doesNotMatch(html, /class="v"/i, 'scroll rail no longer includes the vertical text label');
assert.match(scrollRailJs, /\.nav ul a\[href\^="#"\]/, 'scroll rail tracks the primary navigation sections');
assert.doesNotMatch(scrollRailJs, /querySelectorAll\('\[data-section\]'\)/, 'scroll rail does not count decorative/unlinked data-section blocks');
assert.doesNotMatch(scrollRailJs, /IntersectionObserver/, 'scroll rail uses scroll position so tall sections like Resultados are not skipped');
assert.match(scrollRailJs, /site:active-section/, 'scroll rail follows active section events from the header navigation');
assert.match(navigationJs, /site:active-section/, 'navigation announces active sections for synced UI');
assert.match(navigationJs, /is-anchor-scrolling/, 'header link scrolling suppresses intermediate section animation state');
assert.match(animationsCss, /body\.is-anchor-scrolling\s+\[data-section\]::after/, 'section gradient sweep is disabled during header-triggered smooth scroll');
assert.match(cardFxJs, /CARD_SELECTOR\s*=\s*'\.svc, \.testi, \.shot'/, 'card effect is limited to the service and result cards shown in the references');
assert.doesNotMatch(cardFxJs, /story-card|step|metric|\.q\b/, 'card effect JavaScript does not target cards outside the referenced sections');
assert.doesNotMatch(cardFxCss, /story-card|step|metric|\.q\b/, 'card effect CSS does not override non-referenced card animations');
assert.match(scrollFx, /ScrollTrigger\.batch\('\.story-card'[\s\S]*filter: 'blur\(0px\)'/, 'story cards keep their original blur-to-sharp reveal');
assert.match(scrollFx, /ScrollTrigger\.batch\('\.step'[\s\S]*classList\.add\('visible'\)/, 'method cards keep their original step-line reveal');
assert.match(scrollFx, /ScrollTrigger\.batch\('\.metric'[\s\S]*autoAlpha: 1, y: 0/, 'metrics keep their original gentle rise reveal');
assert.match(scrollFx, /ScrollTrigger\.create\(\{[\s\S]*trigger:\s*node[\s\S]*onEnter:\s*\(\)\s*=>\s*runCount[\s\S]*onEnterBack:\s*\(\)\s*=>\s*runCount/, 'number count-ups replay when scrolling down or back up into view');
assert.doesNotMatch(scrollFx, /scrollTrigger:\s*isHero\s*\?\s*null\s*:\s*\{[\s\S]*once:\s*true/, 'number count-ups are not locked to a one-time ScrollTrigger');
assert.match(scrollSmootherJs, /new Lenis\(\{[\s\S]*smoothWheel:\s*true[\s\S]*syncTouch:\s*false/, 'Lenis remains the active scroll engine while touch scroll stays native');
assert.doesNotMatch(scrollSmootherJs, /syncFromNative|scrollTo\(native/, 'native scroll is not forced back into Lenis on every frame');
assert.match(scrollSmootherJs, /reconcileNativeScroll\(lenis\)/, 'native scroll divergence is reconciled from real scroll events');
assert.match(scrollSmootherJs, /installNativeScrollResets\(lenis\)/, 'native scrollbar and middle-button paths reset Lenis without blocking browser scrolling');
assert.match(scrollSmootherJs, /startNativeScrollPump\(ScrollTrigger\)/, 'native scrollbar and middle-button paths keep ScrollTrigger updating between sparse native events');
assert.doesNotMatch(scrollSmootherJs, /addEventListener\('click'[\s\S]*a\[href\^="#"\]/, 'scroll smoother does not install a second anchor router over the navigation module');
assert.match(html, /lenis@1\.1\.20\/dist\/lenis\.min\.js/, 'Lenis CDN script is loaded for smooth wheel scrolling');
assert.match(fs.readFileSync('css/base.css', 'utf8'), /html\.lenis,\s*html\.lenis body/, 'Lenis utility classes keep the document height compatible with the scroll engine');
assert.doesNotMatch(fs.readFileSync('js/dumbbell-3d.js', 'utf8'), /innerWidth\s*<\s*760[\s\S]{0,220}#historia \.sec-num/, 'mobile dumbbell does not dock to the story number/heading band');
assert.match(fs.readFileSync('js/dumbbell-3d.js', 'utf8'), /#historia \.story-img/, 'mobile dumbbell docks to the story image area instead of the text heading');
assert.match(navigationJs, /smoothScrollTo/, 'navigation routes section links through the shared smooth scroll helper');
assert.match(navCss, /aria-current="true"[\s\S]*linear-gradient|\.nav ul a\.is-active[\s\S]*linear-gradient/i, 'nav has a gradient active or hover treatment');
assert.match(navCss, /color:\s*rgba\(242,\s*244,\s*248,\s*\.9[0-9]\)/, 'nav inactive text is stronger and whiter');
assert.match(navCss, /text-shadow:\s*0 0 28px/, 'nav active gradient has a stronger glow');
assert.match(mainCss, /animations\.css/, 'highlight animation stylesheet is loaded');
assert.match(animationsCss, /@keyframes\s+highlightGradientFlow/, 'highlighted text has a continuous gradient keyframe');
assert.match(animationsCss, /to\s*\{\s*background-position:\s*calc\(-1 \* var\(--highlight-tile\)\)\s+50%;\s*\}/, 'highlight gradient moves by one exact tile for a seamless loop');
assert.match(animationsCss, /\.grad-text[\s\S]*animation:\s*highlightGradientFlow\s+10\.5s\s+linear\s+infinite\s*!important/, 'grad-text highlights animate nonstop at a gently faster pace');
assert.doesNotMatch(animationsCss, /background-position:\s*0%\s+50%\s*!important/, 'highlight background position is not locked against its keyframe animation');
assert.match(animationsCss, /\.hero h1 \.l span\.grad-text[\s\S]*rise 1s var\(--ease\) \.12s forwards,[\s\S]*highlightGradientFlow/, 'hero highlighted word keeps its rise entrance while the gradient flows');
assert.match(animationsCss, /\.final h2 \.accent[\s\S]*animation:\s*highlightGradientFlow/, 'final CTA accent uses the same nonstop highlight animation');
assert.doesNotMatch(animationsCss, /\.eyebrow|\.sec-num|\.hero \.stats \.s strong|\.metric strong|\.step \.n|\.story-card \.ic|\.svc \.label|\.testi \.quote|\.shot \.num|\.ticker span i/, 'only highlighted word selectors receive the nonstop text gradient');
assert.match(animationsCss, /prefers-reduced-motion:\s*reduce[\s\S]*\.grad-text[\s\S]*animation-iteration-count:\s*infinite\s*!important/, 'highlight word gradients keep flowing even when larger motion is reduced');
assert.doesNotMatch(mainCss + navCss + animationsCss, /#f7d6df|#d98da9|#b897ff|#5aa8ff|#f2f7ff|pink/i, 'highlight gradients avoid off-palette pink/lavender tones');
assert.match(animationsCss, /--highlight-tile:\s*clamp\(360px,\s*46vw,\s*720px\)/, 'highlight gradient tile is responsive and large enough to visibly move');
assert.match(animationsCss, /background-size:\s*var\(--highlight-tile\)\s+100%\s*!important/, 'highlight gradient uses a seamless tile-sized background');
assert.match(buttonsCss, /border-radius:\s*999px/i, 'CTA buttons keep the rounded pill shape');
assert.ok((html.match(/data-count/gi) || []).length >= 7, 'all hero and metric numbers are marked for count-up animation');

assert.equal(zIndexFor('#dumbbell-stage', stageCss), 5, 'dumbbell canvas keeps the intended stage layer');
assert.ok(zIndexFor('.hero h1 .l:nth-child(1)', heroCss) < 5, 'SUBA AO SEU sits below the dumbbell');
assert.ok(zIndexFor('.hero h1 .l:nth-child(2)', heroCss) > 5, 'PROXIMO sits above the dumbbell');
assert.ok(zIndexFor('.hero h1 .l:nth-child(3)', heroCss) < 5, 'PATAMAR sits below the dumbbell');
assert.ok(zIndexFor('.hero-visual', heroCss) < 5, 'hero image sits below the dumbbell');

console.log('site audit passed');
