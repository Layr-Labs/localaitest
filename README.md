# The Local AI Purity Test

The official purity test for people who run open-weight models at home. 100 questions. Your score is how many you've done, and it earns you a rank from Curious to Legend.

**Take it at [localaitest.com](https://localaitest.com)**

![The Local AI Purity Test share card](docs/home-card.png)

## How it works

Tick everything you've done. Your score is the number of items you ticked, so higher means more local.

Your score earns a rank, from Curious to Legend:

| Score | Rank | Quant |
|---|---|---|
| 0–5 | Curious | `FP32` |
| 6–15 | Explorer | `FP16` |
| 16–30 | Tinkerer | `Q8_0` |
| 31–45 | Regular | `Q6_K` |
| 46–60 | Enthusiast | `Q5_K_M` |
| 61–75 | Builder | `Q4_K_M` |
| 76–90 | Power User | `Q2_K` |
| 91–100 | Legend | `IQ1_S` |

Every score gets its own share link (like [`/r/66-rich`](https://localaitest.com/r/66-rich)) and its own rank card, in the rank's color. Legend gets black and gold:

![A rank card: You're a Builder, 66/100](docs/share-card.png)

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
- Hover jokes on 34 items, including a deliberately bad pelican on a bicycle
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
- Rank cards generated with `next/og`, with a laurel wreath drawn as SVG in each rank's color; all 505 result pages are prerendered at build time
- The results page, the downloaded image, and the image attached to X posts all use the same rendered card
- Hosted on [Vercel](https://vercel.com)

## Project layout

| Path | What's there |
|---|---|
| `src/data/items.ts` | The 100 items, their hover jokes, and which ones can be autofilled |
| `src/lib/score.ts` | Ranks, quant tiers, roasts, rig badges, result codes, and share text |
| `src/lib/rig.ts` | Hugging Face hardware parsing, the device picker list, and hardware rules |
| `src/lib/detect.ts` | Browser-side Hugging Face and GitHub lookups |
| `src/lib/og.tsx` | The rank card and homepage card layouts |
| `src/lib/laurel.ts` | The laurel wreath, drawn as SVG |
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

Inspired by the work of [Tyler](https://x.com/tyler_fong_) and [Sarah](https://x.com/MilksandMatcha) on [sfpurity.com](https://sfpurity.com), and the original [Rice Purity Test](https://en.wikipedia.org/wiki/Rice_Purity_Test).

## License

The code is released under the [MIT License](LICENSE).

The name "Local AI Purity Test", the localaitest.com domain, and the Local AI Builders branding are not covered by the license. If you fork this, please give it your own name.

The bundled fonts are licensed separately under the SIL Open Font License 1.1: [Inter](assets/fonts/OFL-Inter.txt) and [Geist Mono](assets/fonts/OFL-GeistMono.txt).
