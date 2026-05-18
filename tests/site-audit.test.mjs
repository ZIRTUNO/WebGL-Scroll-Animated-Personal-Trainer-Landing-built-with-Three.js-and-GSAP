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
const baseCss = fs.readFileSync('css/base.css', 'utf8');
const storyCss = fs.readFileSync('css/story.css', 'utf8');
const tickerCss = fs.readFileSync('css/ticker.css', 'utf8');
const layoutCss = fs.readFileSync('css/layout.css', 'utf8');
const footerCss = fs.readFileSync('css/footer.css', 'utf8');
const servicesCss = fs.readFileSync('css/services.css', 'utf8');
const fabCss = fs.readFileSync('css/fab.css', 'utf8');
const faqCss = fs.readFileSync('css/faq.css', 'utf8');
const resultsCss = fs.readFileSync('css/results.css', 'utf8');
const scrollRailCss = fs.readFileSync('css/scroll-rail.css', 'utf8');
const finalCss = fs.readFileSync('css/final-cta.css', 'utf8');
const stageCss = fs.readFileSync('css/dumbbell-stage.css', 'utf8');
const scrollFx = fs.readFileSync('js/scroll-fx.js', 'utf8');
const scrollSyncJs = fs.readFileSync('js/scroll-sync.js', 'utf8');
const mainJs = fs.readFileSync('js/main.js', 'utf8');
const cardFxJs = fs.readFileSync('js/card-fx.js', 'utf8');
const cardFxCss = fs.readFileSync('css/card-fx.css', 'utf8');
const scrollRailJs = fs.readFileSync('js/scroll-rail.js', 'utf8');
const navigationJs = fs.readFileSync('js/navigation.js', 'utf8');
const navMenuJs = fs.readFileSync('js/nav-menu.js', 'utf8');
const focusModalityJs = fs.existsSync('js/focus-modality.js')
  ? fs.readFileSync('js/focus-modality.js', 'utf8')
  : '';
const animationsCss = fs.readFileSync('css/animations.css', 'utf8');
const dumbbell3dJs = fs.readFileSync('js/dumbbell-3d.js', 'utf8');

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
assert.match(footerCss, /\.footer-logo img\s*\{[\s\S]*clamp\(54px,\s*4\.4vw,\s*64px\)[\s\S]*object-fit:\s*contain/, 'footer logo is visibly sized and responsive');
assert.match(html, /<script\s+type="application\/ld\+json">[\s\S]*"@type":\s*"Person"[\s\S]*<\/script>/i, 'Person JSON-LD is present');
assert.doesNotMatch(visibleHtml, /---|—|–|â€”|â€“/, 'visible copy avoids dash separators and mojibake dash artifacts');

const tickerSets = [...html.matchAll(/<div class="ticker-set">([\s\S]*?)<\/div>/gi)].map((match) =>
  match[1].replace(/\s+/g, ' ').trim(),
);
assert.ok(tickerSets.length >= 2, 'ticker duplicates a complete content set for continuous marquee travel');
assert.equal(tickerSets[0], tickerSets[1], 'ticker duplicate sets are byte-equivalent after whitespace normalization');
assert.match(tickerCss, /\.ticker \.track\s*\{[\s\S]*display:\s*flex[\s\S]*width:\s*max-content[\s\S]*will-change:\s*transform/, 'ticker track uses a stable max-content flex rail');
assert.match(tickerCss, /\.ticker-set\s*\{[\s\S]*flex:\s*0 0 auto[\s\S]*gap:\s*clamp/, 'ticker sets are equal-width non-shrinking groups with responsive spacing');
assert.doesNotMatch(tickerCss, /\.ticker \.track\s*\{[\s\S]*padding-left:/, 'ticker track has no one-sided padding that causes a visible reset jump');
assert.match(tickerCss, /to\s*\{\s*transform:\s*translate3d\(-50%,\s*0,\s*0\);?\s*\}/, 'ticker translates by exactly half of the duplicated rail');

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
assert.match(mainJs, /initFocusModality/, 'focus modality module is booted before interactive components');
assert.match(focusModalityJs, /event\.key\s*===\s*'Tab'[\s\S]*is-keyboard-modality/, 'keyboard modality is enabled only by Tab navigation');
assert.match(focusModalityJs, /classList\.remove\('is-keyboard-modality'\)[\s\S]*pointerdown[\s\S]*clearKeyboardModality/, 'pointer/touch input clears keyboard modality');
assert.match(focusModalityJs, /scroll[\s\S]*clearKeyboardModality/, 'ordinary mobile scroll clears keyboard modality so the skip link cannot remain exposed');
assert.match(focusModalityJs, /focusin[\s\S]*skip-link[\s\S]*blur\(\)/, 'touch/browser focus on the skip link is defused when keyboard modality is not active');
assert.match(baseCss, /html\.is-keyboard-modality\s+\.skip-link:focus-visible\s*\{[\s\S]*transform:\s*translateY\(0\)/, 'skip link only slides into view during real keyboard navigation');
const skipFocusBlock = baseCss.match(/(?:^|\n)\.skip-link:focus-visible\s*\{([^}]*)\}/)?.[1] || '';
assert.doesNotMatch(skipFocusBlock, /transform:\s*translateY\(0\)/, 'touch or scroll focus cannot expose the skip link as a purple bar');
assert.match(baseCss, /@media\s*\((?:hover:\s*none|pointer:\s*coarse)\)[\s\S]*\.skip-link[\s\S]*opacity:\s*0\s*!important/, 'coarse pointer/mobile viewports keep the skip link visually hidden');
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
assert.match(mainJs, /initNativeScrollSync/, 'native scroll synchronization is booted before scroll animations');
assert.doesNotMatch(html + mainJs + navigationJs + navMenuJs + scrollSyncJs + fs.readFileSync('css/base.css', 'utf8'), /\bLenis\b|lenis@|\.lenis\b/, 'Lenis is fully removed from runtime code and CSS');
assert.match(scrollSyncJs, /addEventListener\('scroll'[\s\S]*requestScrollTriggerUpdate/, 'native scroll events update ScrollTrigger directly');
assert.match(scrollSyncJs, /button\s*===\s*1[\s\S]*startScrollTriggerPump/, 'middle-button auto-scroll starts a short ScrollTrigger update pump');
assert.match(scrollSyncJs, /isScrollbarPointer[\s\S]*startScrollTriggerPump/, 'native scrollbar drags start the same ScrollTrigger update pump');
assert.match(scrollSyncJs, /event\.ctrlKey[\s\S]*requestViewportRefresh/, 'Ctrl+wheel zoom refreshes ScrollTrigger without blocking browser zoom');
assert.match(scrollSyncJs, /getViewportSignature[\s\S]*hasViewportChanged/, 'viewport refreshes are guarded by an actual viewport-size or zoom change');
assert.match(scrollSyncJs, /visualViewport[\s\S]*resize[\s\S]*requestViewportRefresh/, 'visual viewport resize refreshes native scroll measurements');
assert.doesNotMatch(scrollSyncJs, /visualViewport\?\.addEventListener\('scroll'[\s\S]*requestViewportRefresh/, 'ordinary visual viewport scrolling does not recalculate ScrollTrigger start/end positions');
assert.doesNotMatch(scrollSyncJs, /preventDefault/, 'native scroll sync does not block wheel, middle-button, scrollbar, or browser zoom input');
assert.doesNotMatch(scrollSyncJs, /addEventListener\('scrollend'[\s\S]*requestViewportRefresh/, 'ordinary scroll completion updates ScrollTrigger instead of recalculating start/end positions');
assert.doesNotMatch(scrollSyncJs, /addEventListener\('click'[\s\S]*a\[href\^="#"\]/, 'scroll sync does not install a second anchor router over the navigation module');
assert.doesNotMatch(baseCss, /html,\s*body\s*\{[\s\S]*overflow-x:\s*hidden/, 'body is not turned into a competing horizontal-overflow scroll container');
assert.match(baseCss, /body\s*\{[\s\S]*overflow-x:\s*clip/, 'body clips horizontal overflow without becoming the wheel scroll container');
assert.doesNotMatch(dumbbell3dJs, /ScrollTrigger\.create/, 'dumbbell path is driven by the native page scroll source, not a second ScrollTrigger timeline');
assert.match(dumbbell3dJs, /function getPageScrollY\(\)[\s\S]*document\.body\?\.scrollTop/, 'dumbbell reads body.scrollTop as a fallback when browsers route wheel input to body');
assert.match(dumbbell3dJs, /const scrollY\s*=\s*getPageScrollY\(\)/, 'dumbbell render loop uses the normalized page scroll source');
assert.match(dumbbell3dJs, /function layoutDocumentRect\([\s\S]*offsetParent/, 'dumbbell anchor measurement uses layout coordinates that are independent of reveal transforms');
assert.match(dumbbell3dJs, /function getResponsiveViewportWidth\(\)[\s\S]*window\.outerWidth/, 'dumbbell responsive sizing uses the unzoomed desktop window width when browser zoom shrinks innerWidth');
assert.match(dumbbell3dJs, /if \(isFinePointerViewport\(\) && outer > 0\)[\s\S]*return outer/, 'fine-pointer desktop sizing stays tied to the browser window width for both zoom-in and zoom-out');
assert.match(dumbbell3dJs, /function getZoomCompensationScale\(\)[\s\S]*outer \/ innerWidth[\s\S]*clamp/, 'dumbbell render scale compensates when browser zoom changes CSS viewport pixels');
assert.match(dumbbell3dJs, /function applyZoomCompensation\([\s\S]*scale:[\s\S]*base\.scale \* zoomScale[\s\S]*dockScale:/, 'dumbbell start and dock scales both use the zoom compensation');
assert.match(dumbbell3dJs, /getDumbbellResponsiveParams\(getResponsiveViewportWidth\(\),\s*innerHeight\)/, 'dumbbell presets are selected from the zoom-stable responsive width');
assert.match(dumbbell3dJs, /function applyCameraDepth\(\)[\s\S]*getResponsiveViewportWidth\(\)/, 'dumbbell camera depth follows the zoom-stable responsive width');
assert.doesNotMatch(dumbbell3dJs, /getDumbbellResponsiveParams\(innerWidth,\s*innerHeight\)/, 'dumbbell presets no longer collapse from desktop to mobile during browser zoom');
assert.match(dumbbell3dJs, /function shouldTrackVisualViewport\(\)[\s\S]*isFinePointerViewport\(\)/, 'visualViewport resize/scale tracking is desktop-only so mobile pinch zoom cannot thrash WebGL layout');
assert.match(dumbbell3dJs, /const baseSignature = \[[\s\S]*window\.innerWidth[\s\S]*window\.innerHeight[\s\S]*getResponsiveViewportWidth\(\)[\s\S]*devicePixelRatio[\s\S]*if \(!shouldTrackVisualViewport\(\)\) return baseSignature\.join\(':'\)/, 'mobile viewport signature ignores visualViewport pinch dimensions');
assert.match(dumbbell3dJs, /responsiveWidth < 760\)[\s\S]*return Math\.min\(dpr,\s*1\.1\)/, 'mobile WebGL DPR is capped low enough to avoid Safari pinch-zoom crashes');
assert.match(dumbbell3dJs, /responsiveWidth < 1080\)[\s\S]*return Math\.min\(dpr,\s*1\.5\)[\s\S]*return Math\.min\(dpr,\s*2\)/, 'tablet and desktop keep higher DPR for smoother dumbbell rendering');
assert.doesNotMatch(dumbbell3dJs, /computeProgressFromScroll|computeDocumentAttachedWorldPosition|heroBottom/, 'dumbbell does not maintain a second manual scroll timeline that can disagree with ScrollTrigger');
assert.match(html, /class="story-dumbbell-dock"/, 'story section exposes a stable dumbbell dock marker');
assert.match(storyCss, /\.story-dumbbell-dock\s*\{[\s\S]*display:\s*inline-block/, 'story dumbbell dock marker has measurable layout');
assert.match(dumbbell3dJs, /querySelector\('\.story-dumbbell-dock'\)/, 'dumbbell docks to the explicit story marker before fallbacks');
assert.match(dumbbell3dJs, /params\.dockLift[\s\S]*innerHeight/, 'docked dumbbell uses a small responsive lift from the explicit story marker');
assert.match(dumbbell3dJs, /documentRect\(element\)[\s\S]*layoutDocumentRect\(element\)/, 'dumbbell documentRect prefers transform-independent layout geometry for stable anchors');
assert.match(dumbbell3dJs, /visualViewport[\s\S]*resize[\s\S]*scheduleLayoutRefresh/, 'dumbbell refreshes anchors when browser zoom changes the visual viewport');
assert.match(dumbbell3dJs, /getViewportSignature[\s\S]*hasViewportChanged/, 'dumbbell path recalculation is guarded by an actual viewport-size or zoom change');
assert.match(dumbbell3dJs, /event\.ctrlKey[\s\S]*scheduleLayoutRefresh/, 'Ctrl+wheel gives the dumbbell a guarded viewport refresh opportunity');
assert.doesNotMatch(dumbbell3dJs, /visualViewport\?\.addEventListener\('scroll'[\s\S]*requestLayoutRefresh/, 'ordinary visual viewport scrolling does not recalculate the dumbbell path');
assert.match(dumbbell3dJs, /function syncStageAttachment\([\s\S]*'absolute'[\s\S]*Math\.round\(scrollEnd\)[\s\S]*stage\.style\.position/, 'docked dumbbell scrolls with the document layer instead of JS-following every scroll frame');
assert.match(dumbbell3dJs, /syncStageAttachment\(state\.progress >= 1\)/, 'stage attachment switches only after exact dock completion to avoid boundary jitter');
assert.doesNotMatch(dumbbell3dJs, /scrollY !== lastScrollY/, 'docked dumbbell does not re-render on every post-dock scroll tick');
assert.doesNotMatch(dumbbell3dJs, /pixelsToWorldY\(overscroll/, 'docked dumbbell does not use scrollY world-offset math that can jitter against native scrolling');
assert.doesNotMatch(dumbbell3dJs, /innerWidth\s*<\s*760[\s\S]{0,220}#historia \.sec-num/, 'mobile dumbbell does not dock to the story number/heading band');
assert.match(dumbbell3dJs, /#historia \.story-img/, 'story image remains only as a fallback when the explicit dock marker is missing');
assert.match(storyCss, /\.story-dumbbell-dock\s*\{[\s\S]*margin-left:\s*clamp\(4px,\s*\.65vw,\s*10px\)/, 'story dock marker stays tight to the Quem e Diego eyebrow across desktop, tablet, and mobile');
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
assert.match(buttonsCss, /\.btn\s*\{[\s\S]*clip-path:\s*inset\(0 round 999px\)[\s\S]*contain:\s*paint/, 'CTA pills are clipped as a single rounded paint layer');
assert.match(buttonsCss, /\.btn \.arrow\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background-clip:\s*padding-box)/, 'button icon circles clip hover paint cleanly');
assert.match(buttonsCss, /\.btn \.arrow::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*rgba/, 'button arrow fill is painted on an isolated inner circle');
assert.match(buttonsCss, /\.btn:hover \.arrow::before\s*\{[\s\S]*background:\s*rgba/, 'button arrow hover fill stays on the isolated inner circle');
assert.match(footerCss, /\.footer-social a\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background-clip:\s*padding-box)/, 'footer social icons prevent gradient artifacts inside the circle');
assert.match(footerCss, /\.footer-social a::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*linear-gradient/, 'footer social icon gradient is painted on an isolated inner circle');
assert.match(footerCss, /\.footer-social a:hover::before,[\s\S]*\.footer-social a:focus-visible::before\s*\{[\s\S]*background:\s*var\(--grad\)/, 'footer social hover gradient stays on the isolated inner circle');
assert.doesNotMatch(footerCss, /\.footer-social a:hover,\s*\.footer-social a:focus-visible\s*\{[^}]*background:\s*var\(--grad\)/, 'footer social hover does not paint the transformed anchor itself');
assert.match(footerCss, /\.footer-totop-arrow\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background-clip:\s*padding-box)/, 'footer to-top icon prevents gradient artifacts inside the circle');
assert.match(footerCss, /\.footer-totop-arrow::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*transparent/, 'footer to-top icon fill is painted on an isolated inner circle');
assert.match(footerCss, /\.footer-totop:hover \.footer-totop-arrow::before,[\s\S]*\.footer-totop:focus-visible \.footer-totop-arrow::before\s*\{[\s\S]*background:\s*var\(--grad\)/, 'footer to-top hover gradient stays on the isolated inner circle');
assert.doesNotMatch(footerCss, /\.footer-totop:hover \.footer-totop-arrow,\s*\.footer-totop:focus-visible \.footer-totop-arrow\s*\{[^}]*background:\s*var\(--grad\)/, 'footer to-top hover does not paint the transformed circle itself');
assert.match(servicesCss, /\.svc \.ic\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background-clip:\s*padding-box)/, 'service icons prevent tiny gradient artifacts around SVGs');
assert.match(servicesCss, /\.svc \.ic::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*linear-gradient/, 'service icon fill is painted on an isolated inner circle');
assert.match(fabCss, /\.fab-whatsapp\s*\{(?=[\s\S]*background:\s*transparent)(?=[\s\S]*isolation:\s*isolate)/, 'floating WhatsApp button keeps gradient paint isolated from the transformed circle');
assert.match(fabCss, /\.fab-whatsapp::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*var\(--grad\)/, 'floating WhatsApp gradient is painted on an inner layer');
assert.doesNotMatch(fabCss, /\.fab-whatsapp\s*\{[^}]*background:\s*var\(--grad\)/, 'floating WhatsApp button does not paint the transformed anchor itself');
assert.match(faqCss, /\.q-ico\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background-clip:\s*padding-box)/, 'FAQ icon circle clips its hover fill cleanly');
assert.match(faqCss, /\.q-ico::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*transparent/, 'FAQ icon fill is painted on an isolated inner circle');
assert.match(faqCss, /\.q\.open \.q-ico::before\s*\{[\s\S]*background:\s*var\(--grad\)/, 'FAQ open-state gradient stays on the isolated inner circle');
assert.doesNotMatch(faqCss, /\.q\.open \.q-ico\s*\{[^}]*background:\s*var\(--grad\)/, 'FAQ open state does not paint the transformed circle itself');
assert.match(resultsCss, /\.testi \.who \.av\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background:\s*transparent)/, 'testimonial avatars avoid direct circle gradient paint');
assert.match(resultsCss, /\.testi \.who \.av::before\s*\{[\s\S]*inset:\s*0[\s\S]*border-radius:\s*inherit[\s\S]*background:\s*var\(--grad\)/, 'testimonial avatar gradient is painted on an inner layer');
assert.doesNotMatch(resultsCss, /\.testi \.who \.av\s*\{[^}]*background:\s*var\(--grad\)/, 'testimonial avatars do not paint the transformed circle itself');
assert.match(scrollRailCss, /\.scroll-rail \.dot\s*\{(?=[\s\S]*overflow:\s*hidden)(?=[\s\S]*background-clip:\s*padding-box)/, 'scroll rail dots clip their active fill cleanly');
assert.match(scrollRailCss, /\.scroll-rail \.dot\.active::before\s*\{[\s\S]*background:\s*var\(--grad\)/, 'scroll rail active fill stays on the isolated inner circle');
assert.doesNotMatch(scrollRailCss, /\.scroll-rail \.dot\.active\s*\{[^}]*background:\s*var\(--grad\)/, 'scroll rail active dot does not paint the transformed circle itself');
assert.match(baseCss, /h1,\s*h2,\s*h3,\s*h4\s*\{[\s\S]*line-height:\s*1\.04/, 'global display headings reserve room for accents and descenders');
assert.match(heroCss, /\.hero h1 \.l\s*\{[\s\S]*padding-block:\s*\.12em \.16em[\s\S]*margin-block:\s*-\.12em -\.16em/, 'hero reveal lines keep overflow while preserving accent room');
assert.match(heroCss, /@media\s*\(max-width:\s*560px\)[\s\S]*--hero-nav-clearance:\s*92px/, 'mobile hero brings the dumbbell closer to the header without changing desktop spacing');
assert.match(finalCss, /\.final h2\s*\{[\s\S]*line-height:\s*1\.04/, 'final CTA heading does not clip accents or bottom punctuation');
assert.match(scrollFx, /outer\.style\.paddingBlock\s*=\s*'0\.14em 0\.18em'/, 'split heading reveal wrappers include vertical breathing room');
assert.match(scrollFx, /outer\.style\.marginBlock\s*=\s*'-0\.14em -0\.18em'/, 'split heading reveal wrappers compensate added breathing room without layout jumps');
assert.match(layoutCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*\.container\s*\{[\s\S]*width:\s*min\(1440px,\s*88vw\)/, 'large desktop containers are intentionally capped and balanced');
assert.match(heroCss, /@media\s*\(min-width:\s*1600px\)[\s\S]*\.hero h1\s*\{[\s\S]*font-size:\s*clamp\(112px,\s*6\.6vw,\s*142px\)/, 'large desktop hero typography scales predictably without runaway sizing');
assert.ok((html.match(/data-count/gi) || []).length >= 7, 'all hero and metric numbers are marked for count-up animation');

assert.equal(zIndexFor('#dumbbell-stage', stageCss), 5, 'dumbbell canvas keeps the intended stage layer');
assert.ok(zIndexFor('.hero h1 .l:nth-child(1)', heroCss) < 5, 'SUBA AO SEU sits below the dumbbell');
assert.ok(zIndexFor('.hero h1 .l:nth-child(2)', heroCss) > 5, 'PROXIMO sits above the dumbbell');
assert.ok(zIndexFor('.hero h1 .l:nth-child(3)', heroCss) < 5, 'PATAMAR sits below the dumbbell');
assert.ok(zIndexFor('.hero-visual', heroCss) < 5, 'hero image sits below the dumbbell');

console.log('site audit passed');
