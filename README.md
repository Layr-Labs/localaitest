# The Local AI Purity Test

The official purity test for people who run open-weight models at home. 100 items, and your score maps to a quant level, from FP32 (pure) down to IQ1_S (you are the weights now).

Live at [localaitest.com](https://localaitest.com) (soon).

## What's in it

- 100 checklist items, stored in `src/data/items.ts`
- A score from 0 to 100 that maps to one of 8 quant tiers (`src/lib/score.ts`)
- An optional rig card: total GPU or unified memory, read from your Hugging Face profile hardware or picked by hand
- Optional autofill from public Hugging Face and GitHub profiles (`src/lib/detect.ts`)
- A share card for every score, generated with `next/og`, plus a downloadable image drawn in the browser
- Jokes: the VRAM bar, the GPU fan, the out-of-memory "AI Assistant", item hover jokes, a hidden phrase, and the 404 page

## Privacy

- Answers, usernames, and hardware stay in the browser (React state + localStorage).
- Hugging Face and GitHub lookups go straight from the browser to their public APIs. Our server never sees a username.
- Share links carry only the score and the rig class, for example `/r/34-rich`.
- No analytics and no session recording.

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
