# The Local AI Purity Test

The official purity test for people who run open-weight models at home. 100 questions, and your score is a quant level: FP32 if you're pure, IQ1_S if you are the weights now.

**Take it at [localaitest.com](https://localaitest.com)**

![The Local AI Purity Test share card](docs/home-card.png)

## How it works

Tick everything you've done. Your score is 100 minus the number of items you ticked, so a higher score means you're more pure.

| Score | Tier | |
|---|---|---|
| 95–100 | `FP32` | You think a GGUF is a Pokémon |
| 85–94 | `FP16` | |
| 70–84 | `Q8_0` | |
| 55–69 | `Q6_K` | |
| 40–54 | `Q5_K_M` | |
| 25–39 | `Q4_K_M` | The default quant, just like you |
| 10–24 | `Q2_K` | |
| 0–9 | `IQ1_S` | You are the weights now |

Every score gets its own share link (like [`/r/34-rich`](https://localaitest.com/r/34-rich)) and its own share card:

![A score card for 34/100 at Q4_K_M on a GPU rich rig](docs/share-card.png)

### Rig card

Optionally add your hardware, either read from the hardware you list on your Hugging Face profile or picked by hand. Your total GPU or unified memory earns a badge:

| Total memory | Badge |
|---|---|
| Under 16GB | GPU poor |
| 16–47GB | VRAM middle class |
| 48–191GB | GPU rich |
| 192GB and up | Datacenter in a closet |

### Autofill

Enter a Hugging Face or GitHub username and the test ticks the items it can prove from public data, each tagged "detected via…" so you can untick it:

- **Hugging Face:** your listed hardware (two 3090s, a 64GB or 512GB Mac, a DGX Spark or Strix Halo), uploaded models, GGUFs, LoRAs, merges, and whether your downloads beat your followers
- **GitHub:** starring llama.cpp, and opening issues or getting PRs merged in llama.cpp, Ollama, or vLLM

### The jokes

- A VRAM bar that fills as you tick items and overflows into "offloading to CPU… 0.4 tok/s"
- A GPU fan and temperature that climb with your answers
- An "Ask an AI Assistant" button that runs out of CUDA memory
- Hover jokes on 33 items, including a deliberately bad pelican on a bicycle
- A score reveal that streams like a local model, at a fake tokens-per-second rate
- A hidden phrase: type `gguf when` anywhere on the page
- A 404 page that tells you to `ollama pull` it

## Privacy

- Your answers never leave your browser. They're saved on your device only (localStorage), and Reset deletes them.
- Autofill is optional. Your browser asks Hugging Face and GitHub directly, so the server never sees a username.
- Share links carry only the score and rig class.
- No accounts, no analytics, and no tracking.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Cache Components) with TypeScript and [Tailwind CSS 4](https://tailwindcss.com)
- Share cards generated with `next/og`; all 505 result pages are prerendered at build time
- The downloadable score image is drawn on a canvas in the browser, so an optional X handle never leaves the device
- Hosted on [Vercel](https://vercel.com)

## Project layout

| Path | What's there |
|---|---|
| `src/data/items.ts` | The 100 items, their hover jokes, and which ones can be autofilled |
| `src/lib/score.ts` | Quant tiers, roasts, rig badges, result codes, and share text |
| `src/lib/rig.ts` | Hugging Face hardware parsing, the device picker list, and hardware rules |
| `src/lib/detect.ts` | Browser-side Hugging Face and GitHub lookups |
| `src/lib/og.tsx` | The share card layouts |
| `src/components/` | The checklist, results page, status bar, autofill panel, and popups |

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm test        # tier, rig, and URL-code unit tests
npm run build   # production build; prerenders all 505 result pages
```

Set `NEXT_PUBLIC_SITE_URL` to override the share-link domain (defaults to `https://localaitest.com`).

## Credits

Made by [Pratik](https://x.com/pratikg).

Inspired by the work of [Tyler](https://x.com/tyler_fong_) and [Sarah](https://x.com/MilksandMatcha) on [sfpurity.com](https://sfpurity.com).
