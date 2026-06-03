/* =========================================================================
   Wiggle Wood — static multi-page generator
   Run: node build.mjs   (writes *.html into the project root)
   Each page shares the living-world chrome (forest bg, canopy, leaves,
   fireflies, nav, footer) and stages characters that interact on the page.
   ========================================================================= */
import { writeFileSync } from "node:fs";

const YEAR = 2026;

/* ---- character cut-outs + alt text ---- */
const ALT = {
  cyd: "Cyd, the dreamer caterpillar",
  cosmo: "Cosmo, the leader caterpillar",
  chadwick: "Chadwick, the joyful joker",
  bellona: "Bellona Butterfly, the guardian",
  luna: "Luna Glow-worm",
  robin: "Robin Robin",
};
const HALO = {
  cyd: "var(--c-cyd-soft)", cosmo: "var(--c-cosmo-soft)", chadwick: "var(--c-chadwick-soft)",
  bellona: "var(--c-bellona-soft)", luna: "var(--c-luna-soft)", robin: "var(--c-robin-soft)",
};

/* an actor = a character that lives on the page */
function actor(spec) {
  const file = spec.img || spec.name;
  const cls = [
    "actor",
    spec.role === "support" ? "actor--support" : "actor--lead",
    spec.flip ? "actor--flip" : "",
    spec.flutter ? "actor--flutter" : "",
  ].filter(Boolean).join(" ");
  return `<img class="${cls}" src="assets/img/characters/${file}.webp" alt="${ALT[spec.name] || spec.name}" loading="lazy" />`;
}

function pageHero(p) {
  const actors = p.actors || [];
  const halo = HALO[(actors[0] || {}).name] || "rgba(255,224,122,.4)";
  const duo = actors.length > 1 ? " is-duo" : "";
  return `
<header class="page-hero">
  <div class="page-hero__inner">
    <div class="page-hero__text" data-reveal>
      <p class="eyebrow">${p.eyebrow}</p>
      <h1 class="h-1">${p.h1}</h1>
      <p class="lead">${p.lead}</p>
    </div>
    <div class="page-hero__art${duo}" data-reveal>
      <div class="page-hero__halo" style="--c:${halo}"></div>
      ${actors.map(actor).join("\n      ")}
    </div>
  </div>
</header>`;
}

/* primary nav + full sitemap (footer) */
const NAV = [
  ["overview", "Overview"],
  ["series", "The Series"],
  ["characters", "Characters"],
  ["world", "The World"],
  ["music", "Music"],
  ["financials", "Financials"],
  ["team", "The Team"],
];

const FOOT = {
  "The Series": [
    ["overview", "Overview"], ["series", "Synopsis &amp; Episodes"], ["characters", "Characters"],
    ["world", "The World"], ["design", "Design"], ["casting", "Casting"], ["music", "Music"],
  ],
  "The Opportunity": [
    ["financials", "Business &amp; Strategy"], ["research", "Market Research"],
    ["ethics", "Ethics &amp; Values"], ["foundation", "Foundation"], ["documents", "Documents"],
  ],
  "The Company": [
    ["team", "Leadership &amp; Team"], ["partners", "Partners"],
    ["mailto:hello@wiggle-wood.com", "Contact"],
  ],
};

function navHtml(active) {
  const links = NAV.map(([slug, label]) =>
    `<a href="${slug === "index" ? "/" : "/" + slug}"${slug === active ? ' class="is-active"' : ""}>${label}</a>`
  ).join("\n    ");
  return `
<nav class="nav" id="top">
  <a class="nav__logo" href="/" aria-label="Wiggle Wood home">
    <img src="assets/img/logo/wigglewood.svg" alt="Wiggle Wood" />
  </a>
  <div class="nav__links" id="navLinks">
    ${links}
  </div>
  <a class="btn btn-sm nav__cta" href="/documents">Investor access &rarr;</a>
  <button class="nav__toggle" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><path d="M1 1h20M1 8h20M1 15h20" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
  </button>
</nav>`;
}

function footHtml() {
  const cols = Object.entries(FOOT).map(([head, items]) => {
    const lis = items.map(([href, label]) => {
      const url = href.startsWith("mailto:") ? href : "/" + href;
      return `<li><a href="${url}">${label}</a></li>`;
    }).join("\n          ");
    return `      <div>
        <h5>${head}</h5>
        <ul>
          ${lis}
        </ul>
      </div>`;
  }).join("\n");
  return `
<footer class="footer">
  <div class="container">
    <div class="footer__top">
      <div class="footer__brand">
        <img src="assets/img/logo/wigglewood.svg" alt="Wiggle Wood" />
        <p>A wholesome, music-led animated series promoting kindness, diversity and inclusion. A brand built to last.</p>
      </div>
${cols}
    </div>
    <div class="footer__bottom">
      <span>&copy; <span data-year>${YEAR}</span> The Wiggle Wood Company. All rights reserved.</span>
      <span>Made with care in the woods.</span>
    </div>
  </div>
</footer>`;
}

/* the always-on living-world backdrop layers */
const WORLD = `
<!-- ===== LIVING FOREST WORLD ===== -->
<div id="forest" aria-hidden="true"></div>
<div class="forest-vignette" aria-hidden="true"></div>
<div class="canopy" aria-hidden="true">
  <img class="canopy__branch canopy__branch--l" src="assets/img/world/branch1-1600.webp" alt="" />
  <img class="canopy__branch canopy__branch--r" src="assets/img/world/branch2-1600.webp" alt="" />
  <img class="canopy__sprig" src="assets/img/world/branch2-1600.webp" alt="" />
</div>
<div class="leaves" aria-hidden="true"></div>`;

function layout(p) {
  const active = p.slug === "index" ? "index" : p.slug;
  const peekers = (p.peekers || []).map(pk =>
    `<div class="peeker peeker--${pk.pos}"><img src="assets/img/characters/${pk.img || pk.name}.webp" alt="" /></div>`
  ).join("\n");
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<script>document.documentElement.classList.add('js');</script>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${p.metaTitle}</title>
<meta name="description" content="${p.metaDesc}" />
<meta name="theme-color" content="#0e2a2b" />
<link rel="icon" href="assets/img/logo/wigglewood.svg" type="image/svg+xml" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${p.metaTitle}" />
<meta property="og:description" content="${p.metaDesc}" />
<meta property="og:image" content="assets/img/hero/hero-1600.jpg" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Pontano+Sans:wght@400;500;600;700&family=Epilogue:wght@500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/wigglewood.css" />
<link rel="stylesheet" href="assets/css/world.css" />
</head>
<body>
${WORLD}
${navHtml(active)}
${peekers}
<main class="page-body">
${p.html}
</main>
${footHtml()}
<script src="assets/js/wigglewood.js" defer></script>
</body>
</html>
`;
}

/* ========================================================================
   PAGE CONTENT
   ===================================================================== */
const PAGES = [];

/* ---------- HOME ---------- */
PAGES.push({
  slug: "index",
  metaTitle: "Wiggle Wood — Discover Delightful Animation",
  metaDesc: "Wiggle Wood is a music-led animated series for children aged three to five, promoting kindness, diversity and inclusion. A global brand and investment opportunity.",
  html: `
<header class="hero">
  <div class="hero__bg">
    <picture>
      <source type="image/webp" srcset="assets/img/hero/hero-2400.webp 2400w, assets/img/hero/hero-1600.webp 1600w, assets/img/hero/hero-1000.webp 1000w" sizes="100vw" />
      <img src="assets/img/hero/hero-1600.jpg" alt="The characters of Wiggle Wood in their magical woodland" fetchpriority="high" />
    </picture>
  </div>
  <div class="hero__scrim"></div>
  <div class="hero__inner">
    <img class="hero__logo" src="assets/img/logo/wigglewood.svg" alt="Wiggle Wood" />
    <h1 class="hero__title">Discover Delightful Animation</h1>
    <p class="hero__sub">A music-led animated series for children aged three to five, promoting kindness, diversity and inclusion. Step inside the world of Wiggle Wood.</p>
    <div class="hero__cta">
      <a class="btn" href="/overview">Explore the world &rarr;</a>
      <a class="btn btn-ghost" href="/documents">Investor access</a>
    </div>
  </div>
  <a class="scroll-cue" href="#enter" aria-label="Scroll down">Enter<span></span></a>
</header>

<section class="section" id="enter" data-reveal>
  <div class="container">
    <p class="eyebrow">Welcome to Wiggle Wood</p>
    <h2 class="h-1 section-rule">A window into a living woodland world.</h2>
    <p class="lead" style="max-width:60ch">Three adventurous caterpillars. One wise guardian butterfly. A forest full of friends to help and feelings to wiggle through. Choose a path below and step inside.</p>
    <div class="portal" data-reveal-stagger>
      <a class="portal__card" href="/overview" style="--c:var(--gold)"><p class="eyebrow">Overview</p><h3>The Vision</h3><p>The brand, the company, the strategy and the once-in-a-generation opportunity.</p><span class="go">Enter &rarr;</span></a>
      <a class="portal__card" href="/series" style="--c:var(--c-cosmo)"><p class="eyebrow">The Series</p><h3>Synopsis &amp; Episodes</h3><p>The story, the format, and the first five episodes of Wiggle Wood.</p><span class="go">Enter &rarr;</span></a>
      <a class="portal__card" href="/characters" style="--c:var(--c-cyd)"><p class="eyebrow">Characters</p><h3>Meet the Wigglers</h3><p>Cyd, Cosmo, Chadwick, Bellona and the woodland friends they meet.</p><span class="go">Enter &rarr;</span></a>
      <a class="portal__card" href="/world" style="--c:var(--c-bellona)"><p class="eyebrow">The World</p><h3>Inside Wiggle Wood</h3><p>Caterpillar Cubby, Wiggle Wood Way, Pebble Brook and the changing seasons.</p><span class="go">Enter &rarr;</span></a>
      <a class="portal__card" href="/music" style="--c:var(--c-chadwick)"><p class="eyebrow">Music</p><h3>Led by Jax Jones</h3><p>Original, irresistible songs at the heart of every single episode.</p><span class="go">Enter &rarr;</span></a>
      <a class="portal__card" href="/financials" style="--c:var(--teal)"><p class="eyebrow">Financials</p><h3>The Opportunity</h3><p>The business model, YouTube-first strategy and projected growth.</p><span class="go">Enter &rarr;</span></a>
    </div>
    <div class="grid traction" style="margin-top:2.5rem" data-reveal-stagger>
      <div class="tract"><div class="big">&pound;400k</div><div class="lab">Already invested in development</div></div>
      <div class="tract"><div class="big">39%</div><div class="lab">UK Animation Tax Credit</div></div>
      <div class="tract"><div class="big">EIS &amp; HMRC</div><div class="lab">Tax credit certification achieved</div></div>
      <div class="tract"><div class="big">Pilot complete</div><div class="lab">Produced to broadcast standard</div></div>
    </div>
  </div>
</section>`,
});

/* ---------- OVERVIEW ---------- */
PAGES.push({
  slug: "overview",
  metaTitle: "Overview — Wiggle Wood",
  metaDesc: "The vision, the brand, the company and the opportunity behind Wiggle Wood.",
  eyebrow: "Overview",
  h1: "By 2035, Wiggle Wood will be the number one children&rsquo;s IP in the world.",
  lead: "A carefully constructed children&rsquo;s IP with the creative foundation, commercial architecture and global ambition to become one of the most loved and trusted brands in the world.",
  actors: [{ name: "cosmo", role: "lead" }],
  peekers: [{ name: "cyd", pos: "bl", img: "cyd-alt" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <h3 class="h-label">The Vision</h3>
        <p>By 2035, Wiggle Wood will be the number one children&rsquo;s IP in the world, generating &pound;1 billion in annual revenue and growing.</p>
        <h3 class="h-label">The Brand</h3>
        <p>Wiggle Wood is a music-led animated series for children aged three to five, home to three adventurous young caterpillars named Cyd, Chadwick and Cosmo. It is a modern take on Aesop&rsquo;s Fables, where every new adventure offers a mirror into the Wigglers&rsquo; own lives. By helping the friends they meet along the way, Cyd, Chadwick and Cosmo develop new skills and learn to navigate their own emotions, abilities and friendships. Each episode features an original, irresistible song through which the caterpillars share their discoveries with Bellona, their guardian butterfly.</p>
        <p>Just like the three to five year olds who will watch it, these little Wigglers are taking their first steps into a big, exciting world, meeting new friends and uncovering nature&rsquo;s best kept secrets. Children and families will come for the comedy and the music. They will stay for the lovable characters and the genuinely valuable insights into their own emotional lives.</p>
        <p>Wiggle Wood is not just a series. It is a carefully constructed children&rsquo;s IP with the creative foundation, commercial architecture and global ambition to become one of the most loved and trusted children&rsquo;s brands in the world.</p>
      </div>
      <div>
        <h3 class="h-label">The Company</h3>
        <p>The Wiggle Wood Company (TWWC), wholly owned by Aim&eacute;e Anderson, holds the full intellectual property rights to Wiggle Wood. Rooted in themes of self-worth, kindness and environmental stewardship, and set in a rich, nature-based world, Wiggle Wood is designed from day one as a global brand platform.</p>
        <h3 class="h-label">The Strategy</h3>
        <p>TWWC is pursuing a bold, digital-first distribution strategy, positioning Wiggle Wood as the first independently financed children&rsquo;s IP purpose-built for YouTube, the largest broadcaster in the world, as its primary release platform. While major studios including Nickelodeon are increasingly prioritising digital-first content, their efforts are internally funded and backed by legacy brand infrastructure. Wiggle Wood represents a distinct opportunity for private investors to participate in an industry-first strategy: independently developed, independently financed, and released directly to a global audience from launch.</p>
        <p>The model builds on the proven success of leading preschool franchises. CoComelon and Blippi demonstrated what YouTube-first children&rsquo;s content can achieve at global scale. Wiggle Wood has something neither of those properties had at the equivalent stage: upfront capital, a world-class creative team, and a fully considered commercial strategy built around the brand from the outset.</p>
        <h3 class="h-label">The Projections</h3>
        <p>The Wiggle Wood channel is projected to grow from approximately 15 million views in Year 1 to 100 million views in Year 2 and 300 million views in Year 3, establishing Wiggle Wood as a major global preschool entertainment channel within its first three years of release.</p>
        <h3 class="h-label">The Opportunity</h3>
        <p>With the UK government&rsquo;s 39% Animation Tax Credit, and &pound;400,000 already invested in development including the completed pilot episode, 20 story premises, the series bible, financial model, independent market research, and both EIS and HMRC tax credit certification achieved, TWWC is now seeking further investment to take Wiggle Wood into full production and launch a scalable global franchise.</p>
        <p>This is a ground-floor opportunity in a brand built to last.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" data-reveal>
  <div class="container">
    <p class="eyebrow">Origin Story</p>
    <h2 class="h-2">Foreword from the Founder and Creator of Wiggle Wood</h2>
    <div class="prose panel-prose">
      <p><em>If you are reading this, it means something about Wiggle Wood has caught your attention. Thank you for being here and for taking the time.</em></p>
      <h4>How Wiggle Wood Began</h4>
      <p>Wiggle Wood did not begin in a boardroom. It did not begin with a five-year plan. It did not begin with funding. It began at a moment when everything felt like it was falling apart.</p>
      <p>I left home in Scotland at seventeen with very big dreams. I wanted to see the world. I wanted to work in film and television. Over the years I built a career in London, New York and Los Angeles. I worked in global PR. I moved into film publicity. I became Managing Director of an international agency. I pioneered new brand divisions. I launched my own company. I worked with major studios, global brands and film festivals.</p>
      <p>Then came the collapse. Deals fell apart. Covid hit. One final opportunity unravelled. I was nearly forty. I thought I might lose my home. I felt I had nothing to show for years of work. I was exhausted. I was broken. And for the first time, I surrendered to the possibility that everything I knew might have to change. And then, three weeks later, Wiggle Wood arrived.</p>
      <h4>The Butterfly</h4>
      <p>At the time, Marks and Spencer and Aldi were in the middle of their now infamous caterpillar cake war. Colin and Cuthbert were suddenly everywhere, full of personality, humour and public affection. I remember waking up one morning and thinking, there is a children&rsquo;s story in the caterpillars. There is something here about transformation, about identity, about becoming.</p>
      <p>At the same time, there was a story I had learned many years earlier that had always stayed with me. A little boy sees a butterfly struggling to emerge from its cocoon. Wanting to help, he carefully cuts it free. The butterfly survives. But it never flies. Because it needed the struggle. The pressure strengthens the wings. The difficulty builds the muscles required to soar. Without the struggle, there is no flight.</p>
      <p>Wiggle Wood was born from that truth. We do not rescue our characters from their feelings. We do not remove the wobble. We help them wiggle through it.</p>
      <h4>Why This Matters</h4>
      <p>Wiggle Wood is deeply personal. It carries the life lessons I learned the hard way. Lessons about identity. About self-worth. About coming home to yourself. Because somewhere along the way, many of us learn that fitting in matters more than being ourselves. And that is where the wobble begins.</p>
      <p>As children, we are trying to make sense of a very big world with very big feelings. We are learning social cues. Navigating friendships. Testing who we are. Childhood can be overwhelming. And in the effort to belong, many of us quietly put parts of ourselves away.</p>
      <p>Wiggle Wood exists to gently interrupt that pattern. At its heart are the lessons I wish I had known sooner: that we are good enough exactly as we are. That perfection is not the goal, authenticity is. That being different is not something to hide, it is our superpower. That failure is not the opposite of success, it is the path to it.</p>
      <p>Every episode carries one quiet truth: <em>To the child: You are enough. To the adult: You always were enough.</em></p>
      <p>Wiggle Wood is entertainment first. Always. We are joyful. Musical. Colourful. Funny. Warm. But woven through every story is emotional truth. We believe we can build one of the world&rsquo;s most trusted children&rsquo;s brands without losing our heart.</p>
      <p><em>&mdash; Aim&eacute;e Anderson, Founder and Creator of Wiggle Wood</em></p>
    </div>
  </div>
</section>`,
});

/* ---------- SERIES ---------- */
PAGES.push({
  slug: "series",
  metaTitle: "The Series — Wiggle Wood",
  metaDesc: "The synopsis, the repeatable episode format, and the first stories of Wiggle Wood.",
  eyebrow: "The Animation Series",
  h1: "Synopsis",
  lead: "Three young caterpillars, one wise butterfly, and a woodland full of friends to help and feelings to wiggle through.",
  actors: [{ name: "cyd", role: "lead" }, { name: "chadwick", role: "support", flip: true }],
  peekers: [{ name: "cosmo", pos: "br" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <p>Our story follows three young caterpillars, affectionately known as the Wigglers: Cyd and Cosmo, two bold and curious girls, and Chadwick, their high-spirited best friend.</p>
        <p>Together they live at Caterpillar Cubby, a branch on The Great Oak in the heart of Wiggle Wood, where they go on hilarious adventures, meet other animals in need of help, and discover nature&rsquo;s best kept secrets.</p>
        <p>In each episode, they meet a new friend and uncover some of life&rsquo;s great lessons, overcoming challenges and realising that individuality, diversity and failure should be celebrated, not feared.</p>
        <p>Guided by Bellona Butterfly, the Wigglers come to understand that it is their differences and idiosyncrasies that make them successful. Wise Bellona reminds them that these lessons are crucial on their journey to becoming butterflies, when they will need great strength to fly. On that important journey, above all else, kindness and love must be their north star.</p>
      </div>
      <div>
        <h3 class="h-label">The Wiggle Wood Format</h3>
        <p>Every 10-minute episode of Wiggle Wood follows the same carefully considered structure, a repeatable emotional journey designed to resonate with preschool children and build genuine developmental value through storytelling, music, and reflection.</p>
        <div class="format-steps">
          <div class="format-step"><span class="step-num">1</span><div><strong>The Emotional Trigger</strong><p>Each episode begins with one or more of the Wigglers experiencing a moment of emotional difficulty: worry, frustration, anxiety, anger, or uncertainty. These are feelings every young child recognises. The episode begins where the child already is.</p></div></div>
          <div class="format-step"><span class="step-num">2</span><div><strong>Wiggle It Out</strong><p>Rather than moving straight into action, the Wigglers pause and wiggle it out. Wiggle It Out is a recurring musical centrepiece of every episode: an uplifting, transitional music video moment in which the characters sing, move, and release their feelings. As the song ends, the Wigglers find themselves somewhere new in the world of Wiggle Wood, ready for what comes next.</p></div></div>
          <div class="format-step"><span class="step-num">3</span><div><strong>The Guest Character</strong><p>In this new location, the Wigglers encounter a woodland resident facing a problem that mirrors their own. By listening, offering comfort, and trying to help, the Wigglers begin to see their own situation differently. Children learn through empathy, not instruction.</p></div></div>
          <div class="format-step"><span class="step-num">4</span><div><strong>The Return to Caterpillar Cubby</strong><p>The Wigglers return home. With Bellona, they reflect on what they have experienced and put their new understanding into words. The episode closes with a reflective song that reinforces the emotional arc of the story.</p></div></div>
          <div class="format-step"><span class="step-num">5</span><div><strong>The Mindfulness Moment</strong><p>Every episode ends with a short mindfulness segment during the credits, offering simple, age-appropriate meditations focused on self-worth, calm, and gratitude. These gentle moments are designed to support positive mental health in young viewers.</p></div></div>
        </div>
        <p style="margin-top:1rem">This structure was developed with direct input from <strong>Dr. Jacqueline Harding</strong>, one of the UK&rsquo;s foremost authorities in early childhood development and brain science. The format is also built to scale: every episode follows the same architecture, which means the creative process is consistent, the production pipeline is efficient, and the audience always knows what to look forward to.</p>
      </div>
    </div>
  </div>
</section>

<section class="section section-alt" data-reveal>
  <div class="container">
    <p class="eyebrow">Episode Stories</p>
    <h2 class="h-2">A glimpse into the storytelling</h2>
    <p>Each story is built around a simple emotional truth, brought to life through character, humour, and the natural world. Twenty episodes have been developed at springboard stage, with the full document available in the Documents section. The five stories below represent the breadth and emotional range of the series, with the remaining 52 episodes per season developed as we move into pre-production.</p>
    <div class="episode-grid" data-reveal-stagger>
      <div class="episode-card"><span class="ep-label">Pilot Episode</span><h4>Show Your Glow</h4><p>Cyd is determined to make the perfect gift for Bellona&rsquo;s Butterversary, but when the Wigglers meet shy Luna Glow-worm, who refuses to shine because she believes her light is not bright enough, Cyd begins to see perfection differently. Through friendship and song, the Wigglers discover that beauty is not about being flawless, but about being proud of who you are and letting your own unique light shine. Together, they learn that your best is beautiful.</p></div>
      <div class="episode-card"><span class="ep-label">Episode 2</span><h4>Don&rsquo;t Yuck my Dung</h4><p>Bruno the dung beetle needs help rolling his dung ball, but Cosmo is not exactly thrilled about touching poo. Bruno sets about teaching the Wigglers about the wonders of dung, and that just because you do not like something, it does not mean everyone feels the same way. And that is perfectly fine.</p></div>
      <div class="episode-card"><span class="ep-label">Episode 3</span><h4>Hog Bugs</h4><p>A gang of greedy, gregarious locusts are passing through Wiggle Wood, intent on eating everything in sight. With a little help from Bellona, the Wigglers show the bothersome bugs that there is more joy in sharing than in gobbling everything up.</p></div>
      <div class="episode-card"><span class="ep-label">Episode 4</span><h4>Noisy Neighbours</h4><p>Cosmo is building a new swing for the Wigglers, but cannot concentrate with Chadwick and Cyd holding an impromptu dance party nearby. She heads off to wiggle out her frustration and bumps into Robin Robin, who is at his wit&rsquo;s end: his neighbour Oliver Owl loves to sing through the night, and nocturnal Robin cannot sleep. The answer turns out to be far simpler than earplugs or soundproofing &mdash; Robin plucks up the courage to talk to Oliver, who is happy to keep it down. Cosmo realises she could do exactly the same with Chadwick and Cyd.</p></div>
      <div class="episode-card"><span class="ep-label">Episode 5</span><h4>Strong As Silk!</h4><p>Gung-ho Chadwick has got himself into quite a pickle, and Cyd and Cosmo are going to need a rope to get him out. Sansi Silkworm offers up her thread, but Chadwick cannot believe something so delicate could possibly hold. He is about to learn that looks can be deceiving, and that things &mdash; and people &mdash; are often far stronger than they appear.</p></div>
    </div>
  </div>
</section>`,
});

/* ---------- CHARACTERS ---------- */
PAGES.push({
  slug: "characters",
  metaTitle: "Meet Our Characters — Wiggle Wood",
  metaDesc: "Say hello to the Wigglers: Cyd, Cosmo and Chadwick, their guardian Bellona Butterfly, and the woodland friends they meet.",
  eyebrow: "Meet Our Characters",
  h1: "Say Hello to The Wigglers!",
  lead: "Three little caterpillars taking their first steps into a big, exciting world &mdash; each one different, each one a superpower.",
  actors: [{ name: "bellona", role: "lead", flutter: true }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="grid char-grid" data-reveal-stagger>
      <article class="char char--cyd">
        <span class="char__role">The Dreamer</span>
        <div class="char__art"><img src="assets/img/characters/cyd.webp" alt="Cyd" loading="lazy" /></div>
        <h3 class="char__name">Cyd</h3>
        <p class="char__tag">Cyd is the imaginative dreamer of the group, full of big ideas, surprising solutions, and the occasional mental detour. She does not just think outside the box. She forgets the box ever existed. Emotionally tuned-in and endlessly curious, Cyd is fascinated by everything and everyone, often pausing to explore every possible outcome before taking action.</p>
        <p class="char__tag">Though her tendency to drift can test her friends&rsquo; patience, her unique perspective and inventive problem-solving often save the day in ways no one else would expect. Her signature move, the Head Spin, helps her see the world from new angles, literally, and when inspiration strikes, she celebrates with a joyful caterpillar Mexican wave and a bum-shaking boogie.</p>
        <p class="char__quote">Slow and steady leaves more time for fun. / Thinking, thinking&hellip; still thinking.</p>
        <p class="char__voice">Voiced by <b>Blanche Anderson</b> &middot; Edinburgh accent</p>
      </article>
      <article class="char char--cosmo">
        <span class="char__role">The Leader</span>
        <div class="char__art"><img src="assets/img/characters/cosmo.webp" alt="Cosmo" loading="lazy" /></div>
        <h3 class="char__name">Cosmo</h3>
        <p class="char__tag">Determined, knowledgeable, and never a minute late, Cosmo is the natural leader of the Wigglers, older than the others by a few minutes and endlessly proud of it. Fascinated by plants for their focus and resilience, she is a walking encyclopaedia with a talent for delivering lectures at precisely the wrong moment.</p>
        <p class="char__tag">A straight-talker and a meticulous planner, Cosmo has already mapped the route before anyone else has found their shoes. She is reliable, precise, and fiercely proactive. But her single-mindedness often causes her to race past the emotional and magical moments along the way. She is also, beneath all that precision, quietly devoted to the people she loves.</p>
        <p class="char__quote">If you want something done properly, do it yourself.</p>
        <p class="char__voice">Voiced by <b>Daisy Sequerra</b> &middot; Yorkshire accent</p>
      </article>
      <article class="char char--chadwick">
        <span class="char__role">The Joker</span>
        <div class="char__art"><img src="assets/img/characters/chadwick.webp" alt="Chadwick" loading="lazy" /></div>
        <h3 class="char__name">Chadwick</h3>
        <p class="char__tag">Chadwick is the high-energy, high-spirited joker of the group. Born without back legs, Chadwick uses a wheelchair, but he is always first to the finish line. Fast-talking, fast-moving, and fiercely independent, he is driven by instinct, confidence, and a love of making others laugh, even when his jokes do not quite land.</p>
        <p class="char__tag">He charges into problems with no plan and unshakeable belief that he and his friends will figure it out. Chadwick&rsquo;s emotions run at full volume. He loves racing, practical jokes, and blueberry juice, but hates feeling ignored or stuck indoors. His signature move, the Caterpillar Curl, sees him roll into a ball and bounce like a pinball.</p>
        <p class="char__quote">Race you! / Hope it works! / Someone needs a hug.</p>
        <p class="char__voice">Voiced by <b>Corinna Brown</b> &middot; South London accent</p>
      </article>
    </div>

    <div class="feature panel" style="margin-top:2.5rem;background:linear-gradient(160deg, rgba(25,65,75,.6), rgba(9,28,29,.82))" data-reveal>
      <div class="feature__art">
        <div class="feature__halo"></div>
        <img src="assets/img/characters/bellona.webp" alt="Bellona Butterfly" loading="lazy" />
      </div>
      <div>
        <span class="char__role" style="background:var(--c-bellona)">The Guardian</span>
        <h3 class="h-2" style="margin:.7rem 0 .5rem">Bellona Butterfly</h3>
        <p>Bellona is the warm, wise heart of Wiggle Wood. Calm, compassionate, and endlessly kind, she helps the Wigglers reflect, grow, and find their own way, without ever making them feel led. Like a cool big sister, Bellona is always nearby but never overbearing, giving the little caterpillars space to explore while gently shining a light on the lessons hidden inside every adventure.</p>
        <p>Unflappable and full of grace, Bellona encourages curiosity and self-discovery, often helping the Wigglers find the words for what they have already understood. She believes wholeheartedly in the power of a song, and her numbers tend to echo through the woods long after she has gone.</p>
        <p class="char__quote" style="color:var(--c-bellona)">&ldquo;What can we learn? / Tell us your story. / You teach me.&rdquo;</p>
        <p class="char__voice">Voice target: <b>Mel C</b> (Spice Girls) &middot; Pilot voiced by Naomi McDonald</p>
      </div>
    </div>

    <h3 class="h-2" style="margin:3rem 0 1.5rem">Guest Characters</h3>
    <p style="margin-bottom:1.5rem">Wiggle Wood is alive with eccentric and endearing visitors, each one bringing fresh challenges, humour, and life lessons to the Wigglers.</p>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:1.2rem" data-reveal-stagger>
      <article class="char char--luna">
        <span class="char__role">Luna Glow-worm</span>
        <div class="char__art" style="height:200px"><img src="assets/img/characters/luna.webp" alt="Luna Glow-worm" loading="lazy" /></div>
        <h3 class="char__name">Luna Glow-worm</h3>
        <p class="char__tag">Luna is the emotional heart of the pilot episode. Shy, sweet, and quietly determined, she is a glow-worm who has convinced herself that her light is not bright enough to be worth sharing. What she discovers, through friendship and a little courage, is that the very glow she has been hiding is the most beautiful thing about her.</p>
        <p class="char__voice">Voiced by <b>Ellie Wallwork</b> &middot; Doctor Who, BBC</p>
      </article>
      <article class="char char--robin">
        <span class="char__role">Robin Robin</span>
        <div class="char__art" style="height:200px"><img src="assets/img/characters/robin.webp" alt="Robin Robin" loading="lazy" /></div>
        <h3 class="char__name">Robin Robin</h3>
        <p class="char__tag">Theatrical, opinionated, and ever so slightly pompous, Robin Robin carries himself with the air of a retired stage actor who has never quite retired. He is tender beneath the bluster, and endlessly entertaining because of the gap between the two.</p>
        <p class="char__voice">Voiced by <b>Shash Hira</b> &middot; Thomas Edison&rsquo;s Secret Lab, Kartoon Channel</p>
      </article>
    </div>
    <div class="mini-chars panel" style="margin-top:1.2rem" data-reveal>
      <div><strong>Oliver Owl</strong> &mdash; Robin Robin&rsquo;s nocturnal neighbour. Oliver loves to sing through the night with the pure joy of someone who has never once been told to keep it down. He means no harm. He simply has no idea what time it is.</div>
      <div><strong>Flora the Honeybee</strong> &mdash; Always busy, always buzzing, and never quite stopping long enough to think things through. Flora means well. Her relentless busyness just has a habit of creating the very problems she is too busy to notice.</div>
      <div><strong>Nancy Weaver</strong> &mdash; A mischievous spider with a genuine gift for spinning stories. Nancy is not exactly dishonest. She just has a very creative relationship with the truth.</div>
    </div>
  </div>
</section>`,
});

/* ---------- WORLD ---------- */
PAGES.push({
  slug: "world",
  metaTitle: "The Wiggle Wood World — Wiggle Wood",
  metaDesc: "Caterpillar Cubby, Wiggle Wood Way, Pebble Brook and the changing seasons of a rich, nature-based world.",
  eyebrow: "The Wiggle Wood World",
  h1: "Welcome to the World of Wiggle Wood",
  lead: "A rich, traditional woodland home to a diverse population of insects, birds and small mammals &mdash; some lifelong residents, some simply passing through.",
  actors: [{ name: "luna", role: "lead" }],
  peekers: [{ name: "robin", pos: "br" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <p>Wiggle Wood is a rich, traditional woodland home to a diverse population of insects, arachnids, reptiles, birds, and small mammals. Some are lifelong residents, while others are simply passing through, meaning the Wigglers might bump into a spider collecting dew from her web, a flamingo who has lost his pink hue due to a shrimp shortage, or even a polar bear who has taken a wrong turn returning from his winter holiday and now needs shade from the spring sun.</p>
        <p>No matter who they are or where they come from, all these animals have one thing in common: they need help from the smallest, most unlikely, and most ingenious creatures in the woods, the Wigglers.</p>
        <p>Set in a natural, temperate environment broadly inspired by the UK (though never explicitly stated), Wiggle Wood features changing seasons that shape both the landscape and the lives within it. This seasonal rhythm creates a rich canvas for storytelling, a single theme can play out in strikingly different ways in spring versus winter. It also allows recurring characters to evolve, with a friend helped during spring facing new, seasonal challenges in autumn as they prepare for colder months.</p>
        <p>This natural cycle opens the door for seasonal specials aligned with children&rsquo;s own life rhythms and key calendar moments, from spring blooms and summer adventures to autumn harvests and winter hibernation. Nature-led themes such as migration, flood, drought, growth, and rebirth provide additional storytelling depth, grounding magical tales in ecological truth.</p>
      </div>
      <div>
        <h3 class="h-label">Key Locations in Wiggle Wood</h3>
        <div class="loc-list">
          <div class="loc-item"><h4>Caterpillar Cubby</h4><p>Nestled in the nook of a 700-year-old Great Oak, Caterpillar Cubby is the heart of Wiggle Wood. Part home, part school, it is where Bellona Butterfly teaches her Wigglers about nature, friendship, and the wider world. Built with caterpillar silk and shaded by a leafy canopy, the Cubby features silk hammocks where the Wigglers unwind after each adventure, opening the roof to stargaze and share stories.</p></div>
          <div class="loc-item"><h4>Wiggle Wood Way</h4><p>The main forest path winding past the Great Oak. Wiggle Wood Way is a gentle highway for creatures big and small. It is a well-trodden track, not a road, where visitors arrive on foot, wings, or their own natural modes of transport, bringing fresh perspectives and stories to the woods.</p></div>
          <div class="loc-item"><h4>Pebble Brook</h4><p>A slow-running stream that meanders through the forest, Pebble Brook provides water, play, and connection. Safe and shallow, it is a favourite spot for the Wigglers to race leaf boats, splash in the sunshine, or follow its flow out towards the lake in the meadow beyond.</p></div>
        </div>
        <figure class="world-feature" style="margin-top:1.5rem">
          <picture>
            <source type="image/webp" srcset="assets/img/world/treehouse-1600.webp" />
            <img src="assets/img/world/treehouse-1600.jpg" alt="Caterpillar Cubby, the treehouse in the Great Oak" loading="lazy" />
          </picture>
          <figcaption>Caterpillar Cubby, nestled in a 700-year-old Great Oak</figcaption>
        </figure>
      </div>
    </div>
  </div>
</section>`,
});

/* ---------- DESIGN ---------- */
PAGES.push({
  slug: "design",
  metaTitle: "Design — Wiggle Wood",
  metaDesc: "The visual language and art direction of Wiggle Wood: warmth, energy and emotional clarity.",
  eyebrow: "Design",
  h1: "Visual Language &amp; Art Direction",
  lead: "Every design choice is guided by one question: will a three to five year old instantly understand what this character is feeling? The answer is always yes.",
  actors: [{ name: "cyd", role: "lead", img: "cyd-alt" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <p>The visual world of Wiggle Wood is built on warmth, energy, and emotional clarity. Every design choice, from colour palette to character shape, is guided by one question: will a three to five year old instantly understand what this character is feeling? The answer is always yes.</p>
        <p>The art direction draws from the rich tradition of British woodland illustration while bringing a contemporary, animation-ready polish. The palette is saturated and joyful without being overstimulating, with each character defined by a signature colour that reinforces their emotional identity on screen.</p>
        <p>Backgrounds are lush, textured, and layered, creating depth and a sense of genuine habitat. Light is used expressively: warm golden tones during moments of discovery and joy, cooler blues and teals during moments of uncertainty, always resolving to warmth.</p>
      </div>
      <div>
        <p>Character design follows the principles of preschool animation best practice: large heads, expressive eyes, clear silhouettes, and exaggerated physicality that translates across small screens and plush toys alike. Each character is immediately distinguishable by shape alone.</p>
        <p>The world is designed to feel safe and inviting while remaining genuinely wild and full of surprise. There are always details to discover: a hidden beetle, a pattern in the bark, a flower that was not there yesterday. This rewards repeat viewing and encourages the kind of close, attentive watching that supports early learning.</p>
        <p>Every design decision is made with both the audience and the commercial lifecycle of the IP in mind. Characters are built for merchandise. Environments are built for live experiences. The visual language is built to travel globally.</p>
      </div>
    </div>
    <div class="grid char-grid" style="margin-top:2.2rem" data-reveal-stagger>
      <article class="char char--cyd"><span class="char__role">Cyd</span><div class="char__art" style="height:200px"><img src="assets/img/characters/cyd.webp" alt="Cyd" loading="lazy" /></div><p class="char__tag" style="min-height:0">A signature lilac glow for the dreamer.</p></article>
      <article class="char char--cosmo"><span class="char__role">Cosmo</span><div class="char__art" style="height:200px"><img src="assets/img/characters/cosmo.webp" alt="Cosmo" loading="lazy" /></div><p class="char__tag" style="min-height:0">Fresh leaf-green for the leader.</p></article>
      <article class="char char--chadwick"><span class="char__role">Chadwick</span><div class="char__art" style="height:200px"><img src="assets/img/characters/chadwick.webp" alt="Chadwick" loading="lazy" /></div><p class="char__tag" style="min-height:0">Warm coral-orange for the joker.</p></article>
    </div>
  </div>
</section>`,
});

/* ---------- CASTING ---------- */
PAGES.push({
  slug: "casting",
  metaTitle: "Casting — Wiggle Wood",
  metaDesc: "The voice cast of Wiggle Wood, combining endearing performances with talent-led recognition.",
  eyebrow: "Casting",
  h1: "Voice Cast",
  lead: "Endearing, distinctive performances that captivate children, and high-recognition names that drive parent engagement, PR and reach.",
  actors: [{ name: "bellona", role: "lead", flutter: true }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <p>In early years animation, the voices behind the characters may be less important to young viewers, but they matter greatly to their caregivers. Wiggle Wood&rsquo;s casting approach combines the best of both worlds: endearing, distinctive vocal performances that captivate children, and high-recognition, talent-led names that drive parent engagement, PR, and social media reach.</p>

    <h3 class="h-label" style="margin-top:2rem">Casting Strategy &mdash; Bellona Butterfly</h3>
    <p>Wiggle Wood&rsquo;s flagship casting choice is <strong>Mel C</strong>, the preferred voice for Bellona Butterfly. Bellona serves as the warm-hearted, wise and gently whimsical narrator of Wiggle Wood, guiding the young caterpillars through moments of emotional uncertainty towards clarity and confidence. The role demands vocal warmth, musical excellence and genuine emotional credibility.</p>
    <p>Mel represents a strategically aligned choice on both creative and commercial grounds. As a member of the Spice Girls, one of the most successful and culturally influential girl groups of all time, she carries decades of global recognition and multi-generational appeal. Combined with her established solo career, she brings immediate cross-border awareness that directly supports Wiggle Wood&rsquo;s day-and-date global YouTube launch strategy.</p>
    <p>Creatively, she offers rare dual capability. An Olivier Awards nominee for her stunning performance in Blood Brothers, she combines proven acting credentials with exceptional vocal strength. Her soft Liverpudlian tone carries both warmth and authority, making her ideally suited to the nurturing, big-sister presence that Bellona embodies.</p>

    <h3 class="h-label" style="margin-top:2rem">Principal Voice Cast</h3>
    <div class="cast-grid" data-reveal-stagger>
      <div class="cast-card" style="--c:var(--c-bellona)"><div class="cast-char">Bellona Butterfly</div><div class="cast-who"><strong>Mel C</strong> (target)</div><div class="cast-note">Pilot voiced by Naomi McDonald</div></div>
      <div class="cast-card" style="--c:var(--c-cosmo)"><div class="cast-char">Cosmo</div><div class="cast-who"><strong>Daisy Sequerra</strong></div><div class="cast-note">Belgravia: The Next Chapter, ITV. Yorkshire accent. Cosmo&rsquo;s grounded delivery captures her endearing honesty, assertive confidence and sharp observational wit.</div></div>
      <div class="cast-card" style="--c:var(--c-cyd)"><div class="cast-char">Cyd</div><div class="cast-who"><strong>Blanche Anderson</strong></div><div class="cast-note">Viewfinder, PlayStation. Soft Edinburgh accent. Blanche&rsquo;s performance gives Cyd a dreamy charm, bringing a playful sensitivity to the world.</div></div>
      <div class="cast-card" style="--c:var(--c-chadwick)"><div class="cast-char">Chadwick</div><div class="cast-who"><strong>Corinna Brown</strong></div><div class="cast-note">Heartstopper, Netflix. Lively South London accent. Corinna&rsquo;s performance captures Chadwick&rsquo;s bold spirit and big-hearted personality.</div></div>
      <div class="cast-card" style="--c:var(--c-luna)"><div class="cast-char">Luna Glow-worm</div><div class="cast-who"><strong>Ellie Wallwork</strong></div><div class="cast-note">Doctor Who, BBC1. Ellie captures Luna&rsquo;s teenage mix of uncertainty and attitude, blending vulnerability with flashes of dry, slightly exasperated humour.</div></div>
      <div class="cast-card" style="--c:var(--c-robin)"><div class="cast-char">Robin Robin</div><div class="cast-who"><strong>Shash Hira</strong></div><div class="cast-note">Thomas Edison&rsquo;s Secret Lab, Kartoon Channel. Transforms Robin into an endearingly theatrical, slightly grumpy elder of the woods.</div></div>
    </div>

    <h3 class="h-label" style="margin-top:2rem">Guest Voice Cast</h3>
    <p>Each additional episode will also feature celebrity guest voices, adding both variety and marketing reach. These guest stars, ideally with their own digital followings, will be rotated regularly, providing repeatable PR moments and allowing the team to test which voices resonate most through YouTube analytics. High-performing guest characters and their corresponding talent can be reintroduced in future episodes, deepening audience connection and extending the IP&rsquo;s influencer network organically.</p>
  </div>
</section>`,
});

/* ---------- MUSIC ---------- */
PAGES.push({
  slug: "music",
  metaTitle: "Music — Wiggle Wood",
  metaDesc: "Original music led by Jax Jones is a core differentiator of Wiggle Wood, embedded into the storytelling of every episode.",
  eyebrow: "Music",
  h1: "Music as a Market Differentiator",
  lead: "Led by BRIT and Grammy-nominated Jax Jones, original music is woven into the storytelling fabric of every single episode.",
  actors: [{ name: "chadwick", role: "lead" }],
  peekers: [{ name: "cyd", pos: "bl" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <p>Led by Musical Director, BRIT and Grammy-nominated songwriter, producer and DJ <strong>Jax Jones</strong>, and supported by Banks and Wag, the top children&rsquo;s songwriting duo in the UK, original music is a core differentiator of Wiggle Wood.</p>
        <p>Disneyesque music is embedded into the storytelling fabric of the series. Each episode features a musical moment that is either emotionally driven, helping characters process feelings, or action-based, supporting play, adventure, movement, or imagination. This musical structure deepens emotional engagement, reinforces learning, and creates a distinctive storytelling rhythm that sets Wiggle Wood apart within the preschool landscape.</p>
        <p>Wiggle Wood adopts a deliberate songbook strategy, designed specifically for the way young children engage with music. Each season features a curated album of 10 original songs that recur across the season&rsquo;s 52 episodes, allowing children to hear the same songs repeatedly and build familiarity. For preschool audiences, repetition drives attachment, participation, and memorisation, meaning songs quickly become recognisable anchors within the Wiggle Wood world.</p>
        <div class="panel" style="margin-top:1.5rem">
          <h3 class="h-label">Musical Director &mdash; Jax Jones</h3>
          <p>Wiggle Wood&rsquo;s original catalogue is led by Grammy nominated producer, DJ and songwriter Jax Jones, who serves as Musical Director. With over four billion global streams, including more than 1.6 billion views on YouTube alone, where he has built a subscriber base of 1.6 million, Jax brings proven digital scale to a platform that sits at the core of Wiggle Wood&rsquo;s distribution strategy.</p>
          <p>His BRIT and Grammy recognition, multi-genre production expertise and extensive international network position Wiggle Wood&rsquo;s music at a mainstream commercial standard from inception. Jax Jones will contribute one original song per season, serving as the marquee track for that season&rsquo;s album. For Season 1, that contribution is the Wiggle Wood theme song.</p>
          <div style="display:flex;flex-wrap:wrap;gap:.6rem;margin-top:.8rem">
            <span class="chip"><span class="dot"></span>4bn+ global streams</span>
            <span class="chip"><span class="dot"></span>BRIT &amp; Grammy nominated</span>
            <span class="chip"><span class="dot"></span>1.6M YouTube subscribers</span>
          </div>
        </div>
        <div class="panel" style="margin-top:1rem">
          <h3 class="h-label">Composers &mdash; Banks &amp; Wag</h3>
          <p>Jax is supported by award-winning British composer duo Banks &amp; Wag, one of the most established and commercially successful partnerships in UK children&rsquo;s television music. Best known for their work on flagship series including <em>Go Jetters</em>, <em>ZingZillas</em>, <em>Blue Peter</em>, <em>Newsround</em> and <em>Mighty Little Bheem</em>, Banks &amp; Wag are recognised leaders in crafting melodic, high-quality pop music for young audiences. Their work has delivered multiple iTunes children&rsquo;s chart number ones and award-winning broadcast credits.</p>
        </div>
      </div>
      <div>
        <h3 class="h-label">The Songs</h3>
        <p>Two original songs have already been written and will anchor the first season.</p>
        <div class="song-card"><h4>Wiggle It Out</h4><p>The series&rsquo; signature track and the one constant across every season of Wiggle Wood. A joyful, irresistibly catchy pop anthem in the spirit of Walking on Sunshine, it is the kind of song that makes children physically unable to sit still. It arrives at the same point in every episode, around one minute in, as a 45-second musical highlight that spotlights each Wiggler in turn with their own signature wiggle move. Its fixed position in the format is intentional: children quickly learn it is coming, which builds anticipation and makes the moment feel like a joyful ritual rather than simply a song.</p></div>
        <div class="song-card"><h4>Best is Beautiful</h4><p>Written for the pilot episode, <em>Show Your Glow</em>. Cyd worries that the present she has made for Bellona Butterfly simply is not good enough. Then she meets Luna Glow-worm, who carries the same quiet fear about her own glow. It is Bellona who brings the episode home, singing <em>Your Best is Beautiful</em> to the Wigglers in a moment of pure warmth and reassurance. <em>&ldquo;It is written in the stars to be proud of who you are, the magic that you make is true. Your best is beautiful.&rdquo;</em> The song is a feel-good ballad, warmer and more hopeful than a pop anthem, designed to leave children and parents alike with their hearts a little fuller.</p></div>
        <div class="song-card"><h4>The Luna Rap</h4><p>An original rap performed by Chadwick in the pilot episode to encourage Luna Glow-worm to move, dance, and let her glow shine. These shorter musical moments reflect the spontaneity and playfulness of the Wiggle Wood world, ensuring music feels embedded in the characters rather than performed for the audience.</p></div>
        <h3 class="h-label" style="margin-top:1.5rem">Music as a Commercial Engine</h3>
        <p>Wiggle Wood will build and retain ownership of its original song catalogue, enabling monetisation across streaming platforms, publishing, sync licensing, soundtrack albums, music videos, and live singalong events. The scale of opportunity is well illustrated by Baby Shark, the most viewed video in YouTube history. Songs such as Can We Fix It from Bob the Builder have generated significant royalties across broadcast, music sales, and licensing.</p>
      </div>
    </div>
  </div>
</section>`,
});

/* ---------- ETHICS ---------- */
PAGES.push({
  slug: "ethics",
  metaTitle: "Ethics &amp; Values — Wiggle Wood",
  metaDesc: "A purpose-driven series committed to emotional, social and environmental wellbeing, built on best practice and transparency.",
  eyebrow: "Ethics",
  h1: "Values",
  lead: "A purpose-driven series committed to emotional, social and environmental wellbeing &mdash; built on best practice, transparency and child-centred storytelling.",
  actors: [{ name: "bellona", role: "lead", flutter: true }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <h3 class="h-label">Best Practice and Production Transparency</h3>
        <p>Wiggle Wood is being built on a foundation of best practice and full production transparency. The series will be bonded through Paterson James, ensuring that a fully delivered series is guaranteed and offering investors confidence that the production will be completed to specification, regardless of circumstance.</p>
        <p>The HMRC Animation Tax Credit will be applied with integrity, both to maximise UK-based production spend and to reinvest in the UK&rsquo;s next generation of creative talent. In line with industry expectations, two percent of the tax credit will be directed back into the industry, supporting the development of emerging professionals. Wiggle Wood will work closely with ScreenSkills UK and Creative Access, a charity dedicated to helping young people from underrepresented backgrounds build careers in the creative industries.</p>
        <p>All revenues will be managed via the independent collections agency Fintage House, ensuring full financial oversight and industry-standard royalty distribution.</p>
        <h3 class="h-label">Ethical Integrity &amp; Child-Centred Storytelling</h3>
        <p>At its core, Wiggle Wood is a purpose-driven series committed to emotional, social, and environmental wellbeing. Every episode is crafted with educational integrity and designed to support healthy emotional development, positive relationships, and age-appropriate curiosity about the natural world. Aligned with YouTube&rsquo;s Made for Kids policies and traditional broadcaster standards.</p>
        <p>There is no imitable content, no overstimulation, and no reliance on fast-cut tactics. Instead, Wiggle Wood promotes calm engagement, positive role modelling, and inclusive values. Wiggle Wood&rsquo;s child development adviser <strong>Dr Jacqueline Harding</strong>, an international child development expert, former BBC Education Editor, and Government Adviser on children&rsquo;s media and education, is a key part of the writing team.</p>
        <h3 class="h-label">Carbon Literacy and Responsibility</h3>
        <p>Wiggle Wood&rsquo;s sustainability commitment is embedded across the full production and operational life of the business. The series will be produced in accordance with Albert, BAFTA&rsquo;s sustainability framework, with a carbon report produced for each episode and series. Wiggle Wood will be enrolling with FuturePlus, an independent sustainability platform. This commitment will be led by <strong>Mark Downes</strong>, one of the UK&rsquo;s most respected figures in sustainable media production.</p>
      </div>
      <div>
        <h3 class="h-label">Diversity and Inclusion</h3>
        <p>Diversity and inclusion, both behind and in front of the camera, is integral to the Wiggle Wood production. Within the series itself, representation is woven into the storytelling from the outset. Chadwick, one of the central characters, is a wheelchair user, supported by specialist disability adviser <strong>Ally Castle MBE</strong>, a former BBC strategist awarded an MBE for services to inclusion in broadcasting. The series also reflects the breadth and richness of regional UK voices, with Scottish representation among its core characters.</p>
        <p>Wiggle Wood&rsquo;s approach to inclusion is embedded within the creative process rather than treated as an afterthought. Wiggle Wood believes that diverse teams and authentic representation strengthen storytelling and ensure that children from a wide range of backgrounds can see themselves reflected in the world of Wiggle Wood.</p>
        <h3 class="h-label">Self-Worth</h3>
        <p>Wiggle Wood is built on the belief that every child deserves to feel seen, valued, and loved exactly as they are. This conviction runs through every episode and extends beyond the stories themselves. Each episode closes with a short, simple mindfulness moment, inviting young audiences to pause, breathe, and appreciate something about themselves or the world around them.</p>
        <p>When children watch Wiggle Wood, they feel safe. They feel accepted. They feel that this is a world they belong in. And when parents watch alongside them, they feel something equally powerful: pride, warmth, and the quiet reassurance that what their child is watching is genuinely good for them.</p>
        <h3 class="h-label">Positive Role Models</h3>
        <p>Every Wiggle Wood character is a role model, not because they are perfect, but because they are self-aware. Characters make mistakes, take responsibility, and make things right. Kindness is at the heart of every story, and behaviour that falls short of that standard is always acknowledged and addressed. Children watching Wiggle Wood see a world where trying to do better is always worthwhile.</p>
      </div>
    </div>
  </div>
</section>`,
});

/* ---------- FINANCIALS ---------- */
PAGES.push({
  slug: "financials",
  metaTitle: "Financials &amp; Strategy — Wiggle Wood",
  metaDesc: "The business model, YouTube-first distribution strategy, profit centres and projected growth of Wiggle Wood.",
  eyebrow: "Financials",
  h1: "The Opportunity",
  lead: "A global children&rsquo;s entertainment brand, not simply an animated series &mdash; with the commercial architecture to scale.",
  actors: [{ name: "cosmo", role: "lead", img: "cosmo-alt" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <h3 class="h-2" style="margin-bottom:1rem">Business Model</h3>
    <h4 class="h-label">How Wiggle Wood Generates Revenue</h4>
    <div class="two-col">
      <div>
        <p>Wiggle Wood is designed as a global children&rsquo;s entertainment brand, not simply an animated series. The model is straightforward. We produce premium animated content and distribute it free on YouTube, the world&rsquo;s largest video platform. This builds a large, loyal, and emotionally engaged global audience. That audience drives revenue across every dimension of the brand.</p>
        <p>The downstream commercial opportunity in children&rsquo;s IP is well established. Brands such as Peppa Pig (brand value approximately $1.7bn USD) and PAW Patrol (brand value over $15bn USD) demonstrate how characters that families fall in love with generate substantial enterprise value. In both cases, the content built the audience. The audience built the brand. The brand built the business.</p>
        <p>Wiggle Wood is being built with the same commercial architecture, but with a structural advantage those brands did not have. Rather than relying on broadcasters to reach families, Wiggle Wood goes directly to YouTube, reaching a global audience immediately, without paywalls, territorial restrictions, or broadcast schedules.</p>
      </div>
      <div>
        <h4 class="h-label">Profit Centres</h4>
        <div class="profit-grid" data-reveal-stagger>
          <div class="profit-item"><strong>YouTube AdSense</strong><p>Revenue generated directly from YouTube advertising against Wiggle Wood content. Based on projected views and standard CPM rates, this represents a growing baseline revenue stream from Year 1.</p></div>
          <div class="profit-item"><strong>Toys &amp; Merchandise</strong><p>Physical product licensing, including plush toys, figures, playsets, apparel, accessories, and homeware. Historically the largest revenue stream for preschool IP.</p></div>
          <div class="profit-item"><strong>Publishing</strong><p>Picture books, activity books, early reader books, and educational workbooks. Publishing extends character relationships into the home and supports literacy development.</p></div>
          <div class="profit-item"><strong>Music &amp; Audio</strong><p>Streaming royalties, downloads, sync licensing, soundtrack albums, and original music catalogue. Wiggle Wood owns its music catalogue outright, with no third-party publishing splits.</p></div>
          <div class="profit-item"><strong>Licensing &amp; Partnerships</strong><p>Food and beverage, health and wellness, educational tools, and family-focused consumer brands. As audience scale grows, licensing fees become increasingly significant.</p></div>
          <div class="profit-item"><strong>Live Experiences</strong><p>Live shows, touring productions, and immersive events. Proven to be a high-margin revenue stream for preschool brands with strong character attachment.</p></div>
          <div class="profit-item"><strong>Broadcast Licensing</strong><p>Secondary licensing of Wiggle Wood content to traditional broadcasters and SVOD platforms once the YouTube audience is established.</p></div>
          <div class="profit-item"><strong>Long-term Opportunities</strong><p>Location-based attractions, feature film development, theatrical release, and premium SVOD licensing as the brand scales.</p></div>
        </div>
      </div>
    </div>

    <h3 class="h-2" style="margin:3rem 0 1rem">YouTube Strategy</h3>
    <div class="two-col">
      <div>
        <p>Wiggle Wood is positioning itself as the first independently financed children&rsquo;s IP purpose-built for YouTube as its primary release platform. YouTube is the world&rsquo;s largest broadcaster, reaching over two billion logged-in users monthly, with children&rsquo;s content consistently among the highest-performing categories globally.</p>
        <p>The strategy is designed around three sequential phases. First, build a high-quality content library rapidly enough to trigger YouTube&rsquo;s recommendation algorithm. Second, convert casual viewers into loyal subscribers through consistent character-led storytelling, music, and emotional connection. Third, use that subscriber base as the foundation for commercial partnerships, licensing deals, and brand extensions.</p>
        <p>CoComelon reached one billion views within its first year of consistent uploading. Blippi went from a single creator to a global franchise generating hundreds of millions in annual revenue. Both properties were built on YouTube-first strategies. Neither had the character depth, creative infrastructure, or commercial architecture that Wiggle Wood has at this stage.</p>
      </div>
      <div>
        <h4 class="h-label">Projected Channel Growth</h4>
        <div class="chart panel" data-reveal data-chart>
          <div class="bar"><div class="bar__fill" data-h="8" data-v="15M"></div><div class="bar__yr">Year 1</div></div>
          <div class="bar"><div class="bar__fill" data-h="34" data-v="100M"></div><div class="bar__yr">Year 2</div></div>
          <div class="bar"><div class="bar__fill" data-h="96" data-v="300M"></div><div class="bar__yr">Year 3</div></div>
        </div>
        <p class="muted" style="margin-top:.8rem;font-size:.9rem">Projected views across Years 1&ndash;3. YouTube&rsquo;s primary role is to act as a powerful global discovery platform. As children and families fall in love with the characters, music and stories, audience growth drives revenue across the wider Wiggle Wood ecosystem.</p>
      </div>
    </div>

    <h3 class="h-2" style="margin:3rem 0 1rem">Sales and Distribution</h3>
    <div class="two-col">
      <div>
        <p>Wiggle Wood&rsquo;s distribution strategy is built around a YouTube-first global launch, with parallel development of traditional broadcast and SVOD licensing as the brand scales. This approach maximises speed to market, minimises early distribution costs, and builds a global audience base before approaching traditional broadcasters from a position of demonstrated demand rather than speculative pitch.</p>
        <p>YouTube provides immediate global reach across 190 countries and 80 languages, with a built-in discovery algorithm that actively surfaces content to matched audiences. For preschool content, YouTube Kids provides a dedicated, brand-safe environment that parents trust and that delivers content directly to the target demographic without intermediaries.</p>
        <p>International distribution and sales representation will be handled by a specialist children&rsquo;s content distribution partner, responsible for licensing Wiggle Wood to traditional broadcasters, SVOD platforms, and educational distributors globally following the initial YouTube launch period.</p>
      </div>
      <div>
        <h4 class="h-label">Marketing Strategy &mdash; Digital Advertising</h4>
        <p>Wiggle Wood&rsquo;s digital advertising strategy is built around reaching parents, caregivers, and family decision-makers at the moments when they are most receptive. The primary digital advertising channels are Facebook and Instagram (Meta), YouTube pre-roll, Pinterest, and programmatic display.</p>
        <p>Meta platforms provide unparalleled targeting capabilities for parents of young children, allowing Wiggle Wood to reach the precise demographic profile of its core audience. YouTube pre-roll advertising places Wiggle Wood content in front of families already consuming children&rsquo;s content, at the moment of highest intent. Influencer partnerships, particularly with parenting and family lifestyle creators, provide trusted third-party endorsement and reach into established parent communities.</p>
      </div>
    </div>

    <div class="grid traction" style="margin-top:2.5rem" data-reveal-stagger>
      <div class="tract"><div class="big">&pound;400k</div><div class="lab">Already invested in development</div></div>
      <div class="tract"><div class="big">39%</div><div class="lab">UK Animation Tax Credit</div></div>
      <div class="tract"><div class="big">EIS &amp; HMRC</div><div class="lab">Tax credit certification achieved</div></div>
      <div class="tract"><div class="big">Pilot complete</div><div class="lab">Produced to broadcast standard</div></div>
    </div>

    <h3 class="h-2" style="margin:3rem 0 1rem">The Financial Model</h3>
    <p>Wiggle Wood has been structured to deploy capital efficiently while building a scalable content library capable of generating long-term recurring revenue across animation, music, consumer products, publishing, and licensing. The section below outlines the funding structure, financial projections and investment mechanics. A detailed financial model is available for review in our data room.</p>
    <div class="two-col" style="margin-top:1.5rem">
      <div>
        <h4 class="h-label">Investment Structure</h4>
        <p>Wiggle Wood offers investors a net profit participation interest in the IP rather than equity in The Wiggle Wood Company. Investors do not hold shares in the business. Instead, they receive a proportional share of net profits generated by Wiggle Wood across all revenue streams, in perpetuity. Returns begin as the series generates income and continue for as long as the IP performs, with no fixed exit event or defined end date. In the event of a future acquisition of the Wiggle Wood IP, investors participate in the proceeds in proportion to their net profit interest. This structure aligns investor returns directly with the commercial performance of the IP &mdash; a long-term, recurring income opportunity rather than a speculative equity stake dependent on a future liquidity event.</p>
        <h4 class="h-label">Funding Structure</h4>
        <div class="fund-grid">
          <div class="fund-card"><strong>Development</strong><p>15% financed by the Creator<br>85% financed by Investor</p></div>
          <div class="fund-card"><strong>Production</strong><p>61% financed by private equity<br>39% financed through the UK Animation Tax Credit (advanced by Coutts Bank)</p></div>
        </div>
      </div>
      <div>
        <h4 class="h-label">Financial Projections</h4>
        <p>Modelling a three-season production of 96 episodes with a production cost of &pound;14.25m (including &pound;2m of marketing), our revenue and cost projections across all classes deliver the following:</p>
        <div class="fig-grid" data-reveal-stagger>
          <div class="fig"><div class="fig__num">&pound;21.1m</div><div class="fig__lab">Positive net cashflow over a 6-year period</div></div>
          <div class="fig"><div class="fig__num">Month 3, Yr 4</div><div class="fig__lab">Cashflow breakeven</div></div>
          <div class="fig"><div class="fig__num">&pound;53.2m</div><div class="fig__lab">Net Present Value incl. terminal value &middot; IRR 103.60%</div></div>
          <div class="fig"><div class="fig__num">&pound;11.8m</div><div class="fig__lab">NPV across 6 years excl. terminal value &middot; IRR 94.16%</div></div>
        </div>
        <p class="muted" style="font-size:.86rem;margin-top:.8rem">Valuation uses the Perpetual Growth Rate method, a 12% discount cost of capital (US Prime 7% + 5%) and a 0% perpetual growth rate. The model will be developed and refined further during this next development phase.</p>
      </div>
    </div>

    <div class="two-col" style="margin-top:2rem">
      <div class="panel">
        <h4 class="h-label" style="margin-top:0">Enterprise Investment Scheme (EIS)</h4>
        <p>Wiggle Wood has received EIS advance assurance from HMRC, making it eligible for investment under the UK Enterprise Investment Scheme. For qualifying UK taxpayers this provides meaningful tax advantages, including 30% income tax relief on the amount invested, exemption from capital gains tax on returns after a minimum three-year holding period, loss relief allowing any losses to be offset against income or capital gains, and CGT deferral relief on gains reinvested through EIS.</p>
        <p class="muted" style="font-size:.86rem">EIS eligibility is subject to individual circumstances and applies to qualifying UK taxpayers only. Investors based outside the UK or paying tax in other jurisdictions should seek independent advice.</p>
      </div>
      <div class="panel">
        <h4 class="h-label" style="margin-top:0">Production Security &amp; Completion Bond</h4>
        <p>Wiggle Wood&rsquo;s production is backed by a completion bond provided by Paterson James, the UK&rsquo;s specialist completion guarantor for animation. A completion bond guarantees to investors that the production will be filmed, completed, and delivered to a high technical standard by an agreed date. Should production exceed its budget, the bulk of any over-costs become the responsibility of the Completion Guarantor rather than the investor.</p>
        <p>Paterson James&rsquo;s involvement also brings the hands-on animation expertise of Bob Thompson, who oversees production on behalf of the underwriter throughout the process.</p>
      </div>
    </div>

    <div class="cta-band" style="margin-top:2.5rem">
      <p class="eyebrow" style="justify-content:center">Investor Term Sheet</p>
      <h2 class="h-2" style="max-width:30ch;margin-inline:auto">Cashflowing three full seasons of Wiggle Wood over a three-year period.</h2>
      <p class="lead" style="max-width:60ch;margin:.7rem auto 1.2rem">The investment funds the production and release of 156 fully broadcast-ready episodes with thirty original songs, including the official theme tune, alongside global marketing activation &mdash; targeting 15m views in Year 1, 100m in Year 2 and 300m in Year 3. The full Investor Term Sheet is available in the data room.</p>
      <a class="btn" href="/documents">View the documents &rarr;</a>
    </div>
  </div>
</section>

<section class="section section-alt" data-reveal>
  <div class="container">
    <p class="eyebrow">Production Timeline</p>
    <h2 class="h-2">From completed pilot to global franchise</h2>
    <div class="timeline" data-reveal-stagger>
      <div class="tl"><div class="tl__when">Now</div><div class="tl__what"><strong>Pilot Complete</strong><p>The pilot episode, <em>Show Your Glow</em>, is complete. It introduces Luna Glow-worm and serves as the creative and commercial proof of concept &mdash; the centrepiece of the investor proposition.</p></div></div>
      <div class="tl"><div class="tl__when">Jun&ndash;Oct 2026</div><div class="tl__what"><strong>Investment Round</strong><p>Wiggle Wood goes out to investors in June 2026 with the objective of closing investment by October 2026. The team, creative, commercial strategy and financial model are all in place, and the pilot provides a tangible demonstration of quality and potential.</p></div></div>
      <div class="tl"><div class="tl__when">Oct 2026&ndash;Apr 2027</div><div class="tl__what"><strong>Pre-Production</strong><p>A six-month pre-production phase. A minimum of 26 episode scripts are drafted, refined and tested with real preschool audiences, alongside character development, storyboarding, voice scheduling, music composition and full production infrastructure.</p></div></div>
      <div class="tl"><div class="tl__when">Apr 2027&ndash;Apr 2028</div><div class="tl__what"><strong>Production</strong><p>All 52 episodes of Season One are produced within 12 months. Producing a full season in advance of launch gives the YouTube channel an unbroken release runway from day one &mdash; critical to algorithmic growth and audience retention.</p></div></div>
      <div class="tl"><div class="tl__when">May 2028</div><div class="tl__what"><strong>YouTube Launch</strong><p>The first episode launches on YouTube. From that point, one new episode publishes every week without pause, building algorithmic momentum.</p></div></div>
      <div class="tl"><div class="tl__when">2028&ndash;2029</div><div class="tl__what"><strong>Season One</strong><p>52 episodes release weekly. Year One marketing targets 15 million views, with English and Spanish releases reaching families across the UK, US, Ireland, Australia, New Zealand and Latin America. Season Two runs in parallel.</p></div></div>
      <div class="tl"><div class="tl__when">2029&ndash;2030</div><div class="tl__what"><strong>Season Two</strong><p>International footprint expands into key European territories, scaling toward 100 million views. Broadcast and streaming conversations progress, and consumer products, publishing and music licensing begin generating meaningful revenue. Season Three runs alongside.</p></div></div>
      <div class="tl"><div class="tl__when">2030&ndash;2031</div><div class="tl__what"><strong>Season Three</strong><p>Wiggle Wood operates as an established global children&rsquo;s brand, targeting 300 million views across an expanding network of languages and territories, with active licensing, a growing consumer-products ecosystem and broadcast partnerships across multiple markets.</p></div></div>
    </div>
  </div>
</section>`,
});

/* ---------- RESEARCH ---------- */
PAGES.push({
  slug: "research",
  metaTitle: "Market Research — Wiggle Wood",
  metaDesc: "Independent market research validating audience appetite for Wiggle Wood among parents and children.",
  eyebrow: "Market Research",
  h1: "Audience Insights",
  lead: "Independent research, commissioned before production, validated audience appetite among both parents and children aged three to five.",
  actors: [{ name: "cyd", role: "lead" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <p>Independent market research was commissioned to validate audience appetite for Wiggle Wood prior to production. The research covered both parent audiences (primary purchasing decision-makers) and child audiences (ages 3&ndash;5) across a representative UK sample.</p>
        <h4 class="h-label">Pilot Testing Results &mdash; Children</h4>
        <p>Child test audiences responded with exceptionally high engagement to the pilot episode. Key findings include strong character identification with all three Wigglers, with Cyd and Chadwick emerging as primary favourites. The Wiggle It Out musical sequence generated spontaneous physical responses in the majority of child participants, with most attempting to replicate the associated dance moves unprompted. Luna Glow-worm tested particularly strongly as a guest character, with high empathy scores and strong desire to see the character return.</p>
        <h4 class="h-label">Pilot Testing Results &mdash; Parents</h4>
        <p>Parent test audiences responded strongly to the emotional and educational framework of Wiggle Wood, with high scores for perceived educational value, emotional safety, and entertainment quality. The mindfulness segment at the end of the episode was highlighted by multiple parent participants as a distinctive and valuable feature. Parents also responded positively to the diversity and inclusion elements of the production, including Chadwick&rsquo;s wheelchair use.</p>
      </div>
      <div>
        <h4 class="h-label">Industry Trends and Opportunities</h4>
        <p>The global children&rsquo;s entertainment market represents one of the most resilient and consistently growing sectors in media and consumer products. Key trends supporting Wiggle Wood&rsquo;s market positioning include the accelerating shift to digital-first content consumption, the growth of YouTube Kids as a primary destination for preschool content, the increasing importance of emotional intelligence and wellbeing content for young audiences, and the global appetite for fresh, character-led IP with strong musical identity.</p>
        <p>The preschool segment specifically benefits from extremely high repeat viewing behaviour, strong parental co-viewing rates, and exceptional merchandise conversion rates. Parents of 3&ndash;5 year olds represent one of the highest-spending demographic groups in consumer markets, with documented willingness to invest in brands that they perceive as aligned with their children&rsquo;s development and wellbeing.</p>
        <h4 class="h-label">IP and Legal</h4>
        <p>The Wiggle Wood Company holds UK trademark registrations for the Wiggle Wood brand and all principal character names. International trademark applications are in progress across key markets including the United States, European Union, and Australia. The full IP portfolio, including all character designs, scripts, music, and brand assets, is owned outright by TWWC with no third-party rights encumbrances.</p>
      </div>
    </div>
  </div>
</section>`,
});

/* ---------- TEAM ---------- */
PAGES.push({
  slug: "team",
  metaTitle: "The Team — Wiggle Wood",
  metaDesc: "The leadership, production team and specialist advisers behind Wiggle Wood.",
  eyebrow: "The Team",
  h1: "Leadership",
  lead: "A world-class creative and commercial team, led by Creator and CEO Aim&eacute;e Anderson, structured to scale into a global franchise.",
  actors: [{ name: "bellona", role: "lead", flutter: true }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="founder panel" style="margin-bottom:2.5rem" data-reveal>
      <div class="founder__badge">AA</div>
      <div>
        <h3 class="h-2" style="font-size:1.5rem">Aim&eacute;e Anderson &mdash; CEO and Creator</h3>
        <p class="muted" style="margin:.5rem 0 0">As Creator and CEO of Wiggle Wood, Aim&eacute;e safeguards the long-term integrity, vision, and cultural direction of the IP as it scales into a global franchise. She leads strategic partnerships, investor engagement, and commercial expansion, ensuring that creative excellence and brand values remain aligned with long-term enterprise value.</p>
        <p class="muted">Aim&eacute;e has worked as a senior marketeer for almost 25 years, building and advising some of the world&rsquo;s most iconic brands through storytelling. A dynamic entrepreneur and C-Suite executive with a track record of leading both in-house and agency teams, she specialised in film and TV for the last 18 years, gaining a board seat at the global film and TV PR agency DDA as Managing Director, working with Netflix, Disney, Universal Studios, Sony, and independent filmmakers worldwide.</p>
        <p class="muted">In 2016, she founded Triple A &mdash; Access All Areas Ltd, a global agency that helped brands create transformative content through pioneering entertainment partnerships in film and television. Her work spans consumer brands including Red Bull, Swarovski, and Hewlett Packard, and A-list film productions including The Infiltrator (Bryan Cranston), The King&rsquo;s Speech (Colin Firth), Terminator 4 (Christian Bale), and Ender&rsquo;s Game (Harrison Ford).</p>
      </div>
    </div>

    <h3 class="h-2" style="margin-bottom:1rem">Organisational Framework</h3>
    <p>Wiggle Wood is structured and operated within the Entrepreneurial Operating System (EOS), a proven business framework used by thousands of scaling companies worldwide. EOS defines a clear distinction between the Visionary and the Integrator: the Visionary sets direction, protects the brand and drives long-term strategy; the Integrator runs the business day-to-day, holding operational accountability and managing the leadership team.</p>
    <p>Within this model, the Chief Executive Officer operates as Visionary, focused on creative direction, investor relationships, strategic partnerships and long-term brand value. The Chief Operating Officer operates as Integrator, with a single direct line of accountability from the CEO and full operational responsibility for the business beneath it. The business is organised into three divisions &mdash; Content, Product and Brand &mdash; each led by a dedicated C-suite officer reporting into the COO. Wiggle Wood works with a professional UK-based EOS facilitator to implement and maintain the framework across the organisation.</p>

    <h4 class="h-label">Strategic Leadership Hires (Planned Post-Investment)</h4>
    <p>The senior leadership team is being assembled with deliberate care. These are significant appointments &mdash; individuals with franchise-level experience in global children&rsquo;s entertainment &mdash; and Wiggle Wood is committed to hiring the right people rather than filling seats quickly. Bringing C-suite leaders on board before funding is in place would be premature for candidates of this calibre, who carry the notice periods and seniority the roles demand. Recruitment begins formally approximately 18 months ahead of launch, with early engagement already underway.</p>
    <div class="roles-grid" data-reveal-stagger>
      <div class="role-card"><h4>Chief Operating Officer</h4><p>The company&rsquo;s Integrator within the EOS framework, reporting directly to the CEO. Establishes and leads the operational infrastructure to scale Wiggle Wood as a global business &mdash; financial oversight, organisational design, legal and governance, and cross-functional efficiency. The Content, Product and Brand officers each report into this role. Requires significant experience scaling media, entertainment or IP-driven businesses.</p></div>
      <div class="role-card"><h4>Chief Content Officer</h4><p>Brings senior experience developing and scaling global children&rsquo;s franchises across series, publishing, licensing and long-form content. Defines and safeguards the long-term creative architecture of the Wiggle Wood universe, working in close partnership with the Showrunner to maintain tonal integrity, character authenticity and narrative cohesion across future seasons, spin-offs and potential feature development. Reports to the COO.</p></div>
      <div class="role-card"><h4>Chief Product Officer</h4><p>Leads the translation of the IP into a cohesive, high-quality product ecosystem. Owns the consumer-products roadmap &mdash; licensing strategy, category development and retail partnerships across toys, publishing, apparel and homeware &mdash; working with the Chief Brand Officer to ensure product integrity. Requires deep experience in children&rsquo;s IP product development and the international licensing landscape. Reports to the COO.</p></div>
      <div class="role-card"><h4>Chief Brand Officer</h4><p>Builds and scales Wiggle Wood as a globally recognised consumer brand, translating the storytelling property into a culturally resonant brand across licensing, partnerships, publishing, music, retail and live experiences. Defines and protects strategic positioning as the IP expands beyond the screen, overseeing brand architecture and audience-growth frameworks. Reports to the COO.</p></div>
    </div>

    <h3 class="h-2" style="margin:3rem 0 1rem">Production Team</h3>
    <div class="two-col">
      <div>
        <h4 class="h-label">Writers</h4>
        <p>The Wiggle Wood writers&rsquo; room is assembled from some of the most experienced and celebrated writers in UK children&rsquo;s television, with additional voices brought in to ensure diversity of perspective, regional representation, and fresh storytelling energy.</p>
        <p>The writing team works within the established Wiggle Wood format structure while retaining creative freedom within each episode to deliver genuine originality, emotional authenticity, and comedic surprise. All scripts are reviewed against the series&rsquo; emotional and developmental framework before production.</p>
        <h4 class="h-label">Animation Partner</h4>
        <p>Wiggle Wood&rsquo;s animation is being produced by a specialist preschool animation studio with an established track record in delivering broadcast-quality content at scale. The animation partner is responsible for all character animation, background art, visual effects, and post-production, working in close collaboration with the creative team to maintain the visual integrity and emotional warmth of the Wiggle Wood world.</p>
      </div>
      <div>
        <h4 class="h-label">Music Team</h4>
        <p>The music team is led by Jax Jones as Musical Director, supported by Banks &amp; Wag as lead composers and songwriters. The team works in close collaboration with the writers and animation partner to ensure that music is fully integrated into the storytelling rather than added as a layer on top of it.</p>
        <h4 class="h-label">International Dubbing</h4>
        <p>Wiggle Wood is designed from the outset for international reach. The series will be produced with dubbing in mind, using clear, well-paced dialogue and musical cues that travel across language barriers. International dubbing will be handled by a specialist localisation partner with experience across preschool content in key markets.</p>
        <h4 class="h-label">Operations</h4>
        <p>Day-to-day operations are managed by a lean, experienced team with backgrounds in children&rsquo;s media production, rights management, and brand development. The operational framework is built to scale efficiently as production volumes increase and the business moves into full franchise development.</p>
      </div>
    </div>

    <h3 class="h-2" style="margin:3rem 0 1rem">Industry &amp; Specialist Advisers</h3>
    <div class="advisers-grid" data-reveal-stagger>
      <div class="adviser-card"><h4>Dr Jacqueline Harding</h4><p>Child Development Adviser. International child development expert, former BBC Education Editor, and Government Adviser on children&rsquo;s media and education. Key part of the writing team.</p></div>
      <div class="adviser-card"><h4>Ally Castle MBE</h4><p>Disability and Inclusion Adviser. Former BBC strategist awarded an MBE for services to inclusion in broadcasting. Specialist adviser on Chadwick&rsquo;s wheelchair-user representation.</p></div>
      <div class="adviser-card"><h4>Mark Downes</h4><p>Sustainability Adviser. Chief Storyteller at Green Eyed Monster Films. Head of Content for the Earth Prize. Former Head of Sustainability at Ecoflix. Produced a trilogy with Sir David Attenborough for Generation Ocean.</p></div>
    </div>
  </div>
</section>`,
});

/* ---------- PARTNERS ---------- */
PAGES.push({
  slug: "partners",
  metaTitle: "Partners — Wiggle Wood",
  metaDesc: "The strategic partners supporting Wiggle Wood across distribution, production, legal, finance and marketing.",
  eyebrow: "Partners",
  h1: "Strategic Partners",
  lead: "A network of specialist partners across distribution, production, legal, finance, insurance and marketing.",
  actors: [{ name: "robin", role: "lead" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="partners-grid" data-reveal-stagger>
      <div class="partner-card"><h4>YouTube and Digital Partner</h4><p>Wiggle Wood&rsquo;s primary distribution partner for digital content. YouTube provides the global platform, discovery algorithm, and monetisation infrastructure for the channel launch and ongoing content strategy.</p></div>
      <div class="partner-card"><h4>International Distribution &amp; Sales</h4><p>Specialist children&rsquo;s content distributor responsible for licensing Wiggle Wood to traditional broadcasters, SVOD platforms, and educational distributors globally following the initial YouTube launch period.</p></div>
      <div class="partner-card"><h4>Production Partner</h4><p>Specialist preschool animation studio responsible for all character animation, background art, visual effects, and post-production for the Wiggle Wood series.</p></div>
      <div class="partner-card"><h4>Legal Partner</h4><p>Specialist media and entertainment law firm advising on IP protection, production agreements, licensing contracts, and investor documentation.</p></div>
      <div class="partner-card"><h4>Bank Partner</h4><p>Banking partner providing financial infrastructure, treasury management, and production financing support for The Wiggle Wood Company.</p></div>
      <div class="partner-card"><h4>PR Partner</h4><p>Specialist entertainment PR agency responsible for Wiggle Wood&rsquo;s media relations, talent PR, and brand communications strategy.</p></div>
      <div class="partner-card"><h4>Advertising Partner</h4><p>Digital advertising and media buying partner responsible for paid audience development across Meta, YouTube, and programmatic channels.</p></div>
      <div class="partner-card"><h4>Influencer Partner</h4><p>Influencer marketing partner managing relationships with parenting and family lifestyle creators to build organic awareness and trusted endorsement within parent communities.</p></div>
      <div class="partner-card"><h4>Gaming &amp; Interactive</h4><p>Partner responsible for developing Wiggle Wood&rsquo;s interactive and gaming extensions, including mobile applications, interactive experiences, and educational games.</p></div>
      <div class="partner-card"><h4>Production Insurance Partner</h4><p>Specialist production insurance partner providing comprehensive coverage for all aspects of Wiggle Wood&rsquo;s production and post-production activities.</p></div>
      <div class="partner-card"><h4>Collections &mdash; Fintage House</h4><p>Independent collections agency responsible for all revenue collection, royalty distribution, and financial oversight across the Wiggle Wood IP portfolio, ensuring full financial transparency.</p></div>
    </div>
  </div>
</section>`,
});

/* ---------- FOUNDATION ---------- */
PAGES.push({
  slug: "foundation",
  metaTitle: "The Wiggle Wood Foundation — Wiggle Wood",
  metaDesc: "The charitable arm of The Wiggle Wood Company, extending its social impact mission beyond the screen.",
  eyebrow: "Wiggle Wood Foundation",
  h1: "The Wiggle Wood Foundation",
  lead: "A brand built on kindness must practice what it preaches. The Foundation extends our mission beyond the screen and into the communities that need it most.",
  actors: [{ name: "luna", role: "lead" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="two-col">
      <div>
        <p>The Wiggle Wood Foundation is the charitable arm of The Wiggle Wood Company, established to ensure that the social impact mission of Wiggle Wood extends beyond the screen and into the communities that need it most.</p>
        <p>The Foundation&rsquo;s work is focused on three core areas: supporting children&rsquo;s emotional wellbeing and mental health, promoting diversity and inclusion in early years education, and protecting and celebrating the natural world that Wiggle Wood calls home.</p>
        <p>The Foundation will be funded through a percentage of Wiggle Wood&rsquo;s commercial revenues, ensuring that as the brand grows, so too does its positive impact. Partnerships with schools, early years settings, and community organisations will allow Wiggle Wood&rsquo;s values of kindness, self-worth, and environmental stewardship to reach children beyond the reach of the series itself.</p>
      </div>
      <div>
        <p>The Foundation&rsquo;s programmes will include the distribution of free Wiggle Wood educational resources to early years settings in underserved communities, partnerships with children&rsquo;s mental health charities to develop mindfulness and emotional literacy resources, environmental education initiatives linked to the nature-based world of Wiggle Wood, and mentorship and career development programmes for young people from underrepresented backgrounds in the creative industries.</p>
        <p>The Wiggle Wood Foundation reflects the belief that a brand built on kindness must practice what it preaches. Commercial success and social impact are not in tension at Wiggle Wood. They are the same thing.</p>
      </div>
    </div>
  </div>
</section>`,
});

/* ---------- DOCUMENTS ---------- */
const DOC_ICON = `<div class="doc-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg></div>`;
function doc(title, desc) {
  const href = `mailto:hello@wiggle-wood.com?subject=${encodeURIComponent("Wiggle Wood data room request: " + title)}`;
  return `<div class="doc-item">${DOC_ICON}<div><h4>${title}</h4><p>${desc}</p><a class="doc-dl" href="${href}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4"/><path d="M5 21h14"/></svg>Request to download</a></div></div>`;
}
PAGES.push({
  slug: "documents",
  metaTitle: "Investor Data Room — Wiggle Wood",
  metaDesc: "Documents available to approved investors: series bible, certifications, financial model, scripts and more.",
  eyebrow: "Documents",
  h1: "Investor Data Room",
  lead: "The following documents are available to approved investors. Please contact us to request access.",
  actors: [{ name: "cosmo", role: "lead" }],
  html: `
<section class="section" data-reveal>
  <div class="container">
    <div class="docs-grid" data-reveal-stagger>
      ${doc("Series Bible", "Full creative document covering the world, characters, format, tone of voice, and long-term storytelling vision.")}
      ${doc("EIS Certificate", "Enterprise Investment Scheme certification from HMRC.")}
      ${doc("HMRC Tax Credit Certificate", "Animation Tax Credit certification from HMRC, confirming eligibility for the 39% UK Animation Tax Credit.")}
      ${doc("Development Schedule", "Full production timeline from current stage through to Series 1 delivery and launch.")}
      ${doc("Development Budget", "Detailed development expenditure to date and projected production budget for Series 1.")}
      ${doc("Pilot Script: Luna Glow-worm", "Full shooting script for the pilot episode, Show Your Glow.")}
      ${doc("Pilot Episode Audio Read", "Audio performance of the pilot script with principal voice cast.")}
      ${doc("Development Term Sheet", "Investor term sheet covering investment structure, equity, EIS eligibility, and return mechanics.")}
      ${doc("UK Trademarks Certificate", "UK Intellectual Property Office trademark registrations for Wiggle Wood brand and characters.")}
      ${doc("Poster Artwork", "High-resolution key art for Wiggle Wood.")}
      ${doc("Market Research Report", "Independent market research report covering parent and child audience testing of the pilot episode.")}
      ${doc("Story Premises", "Story outlines and extended premises for 20 developed springboard episodes.")}
    </div>
    <div class="cta-band" style="margin-top:2.5rem">
      <p class="eyebrow" style="justify-content:center">Request Access</p>
      <h2 class="h-2" style="max-width:24ch;margin-inline:auto">Request access to the full data room.</h2>
      <p class="lead" style="max-width:54ch;margin:.7rem auto 1.7rem">We would love to walk you through the full pitch, the broadcast-standard pilot and the financials.</p>
      <a class="btn" href="mailto:hello@wiggle-wood.com">Request data room access &rarr;</a>
    </div>
  </div>
</section>`,
});

/* ========================================================================
   RENDER
   ===================================================================== */
for (const p of PAGES) {
  // inner pages get a page-hero with staged characters; home builds its own hero
  if (p.slug !== "index") {
    p.html = pageHero(p) + p.html;
  }
  const file = p.slug === "index" ? "index.html" : `${p.slug}.html`;
  writeFileSync(new URL(`./${file}`, import.meta.url), layout(p));
  console.log("wrote", file);
}
console.log(`\nDone — ${PAGES.length} pages generated.`);
