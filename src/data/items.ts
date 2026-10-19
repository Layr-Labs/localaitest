/** Rules that let an item be ticked automatically from a public profile or the user's rig. */
export type DetectRule =
  | "hw-two-3090s"
  | "hw-mac-64"
  | "hw-mac-512"
  | "hw-spark-or-strix"
  | "hw-two-sparks"
  | "hw-four-sparks"
  | "hf-lora"
  | "hf-merge"
  | "hf-uploaded"
  | "hf-gguf"
  | "hf-downloads-beat-followers"
  | "gh-starred-llamacpp"
  | "gh-issue"
  | "gh-merged-pr";

/**
 * A small joke revealed when the item is hovered, focused, or checked.
 * "slow" types the text out one character at a time; "pelican" renders a bad SVG.
 */
export type Joke = string | { kind: "slow"; text: string } | { kind: "pelican" };

export type Item = {
  id: number;
  text: string;
  detect?: DetectRule;
  joke?: Joke;
};

export const ITEMS: Item[] = [
  { id: 1, text: "Checked how much VRAM a laptop had before checking anything else" },
  { id: 2, text: 'Bought a GPU "for gaming" and never launched a game' },
  { id: 3, text: "Bought a used RTX 3090 for the VRAM", joke: "It was mined on. It's fine. It's fine." },
  { id: 4, text: "Owned two or more 3090s at the same time", detect: "hw-two-3090s" },
  { id: 5, text: "Ran one model split across GPUs with different VRAM sizes" },
  { id: 6, text: 'Bought a Mac with 64GB+ unified memory "for local inference"', detect: "hw-mac-64" },
  { id: 7, text: "Bought a Mac with 512GB of unified memory", detect: "hw-mac-512", joke: "For productivity. Obviously." },
  { id: 8, text: "Clustered multiple Macs or PCs to run one model" },
  { id: 9, text: "Bought a DGX Spark or a Strix Halo (Ryzen AI Max) mini PC", detect: "hw-spark-or-strix" },
  { id: 10, text: "Priced out an RTX Pro 6000 and closed the tab", joke: "The cart is still open in another tab." },
  { id: 11, text: "Used PCIe risers or an open-air mining frame" },
  { id: 12, text: "Tripped a breaker or needed a new circuit for your rig", joke: "A quick power upgrade to the house." },
  { id: 13, text: "Power-limited or undervolted your GPUs" },
  { id: 14, text: "Know your GPU's memory bandwidth by heart", joke: "Nobody asked. You told them anyway." },
  { id: 15, text: "Made a tokens-per-second-per-dollar spreadsheet" },
  { id: 16, text: 'Called yourself "GPU poor"', joke: "Usually said by someone with two 4090s." },
  { id: 17, text: 'Rented a cloud GPU to run a "local" model', joke: "Local to the datacenter, technically." },
  { id: 18, text: "Ran an LLM on a Raspberry Pi just to prove you could" },
  { id: 19, text: "Ran an LLM on your phone" },
  { id: 20, text: "Ran an LLM entirely in the browser with WebGPU" },
  { id: 21, text: "Installed Ollama" },
  { id: 22, text: "Left Ollama for llama.cpp", joke: "And you tell people about it." },
  { id: 23, text: "Compiled llama.cpp from source" },
  { id: 24, text: "Pulled a new llama.cpp build more than once in one day", joke: "Three new builds dropped while you read this." },
  { id: 25, text: "Used LM Studio" },
  { id: 26, text: "Used MLX on a Mac" },
  { id: 27, text: "Fought CUDA versions to get vLLM or SGLang running" },
  { id: 28, text: "Used text-generation-webui (oobabooga)" },
  { id: 29, text: "Set up Open WebUI" },
  { id: 30, text: "Used KoboldCpp or SillyTavern" },
  { id: 31, text: "Wrote an Ollama Modelfile" },
  { id: 32, text: "Fixed a broken chat template by hand", joke: "Jinja. In this economy." },
  { id: 33, text: "Pointed a coding agent (Claude Code, Cline, Aider) at a local endpoint" },
  { id: 34, text: "Used a local model as your coding agent for a week, then went back", joke: "It was fine. It was not fine." },
  { id: 35, text: 'Hit "CUDA out of memory" and cut the context instead of the model size' },
  { id: 36, text: "Quantized your KV cache" },
  { id: 37, text: "Tried speculative decoding" },
  { id: 38, text: "Built a local RAG over your own notes" },
  { id: 39, text: "Ran a home AI server on Proxmox or Unraid" },
  { id: 40, text: "Wired a local LLM into Home Assistant" },
  { id: 41, text: "Ran Whisper locally" },
  { id: 42, text: "Have a ComfyUI workflow that looks like spaghetti" },
  { id: 43, text: "Offloaded MoE experts to CPU to fit a model that shouldn't fit", joke: "It shouldn't fit. It fits. Barely." },
  { id: 44, text: "Know what Q4_K_M means without googling" },
  { id: 45, text: "Argued about imatrix quants" },
  { id: 46, text: "Downloaded a GGUF from TheBloke", joke: "🫡" },
  { id: 47, text: "Downloaded quants from bartowski or Unsloth" },
  { id: 48, text: "Downloaded a model on release day and the GGUF was broken" },
  { id: 49, text: 'Re-downloaded the "fixed" GGUF the next day' },
  { id: 50, text: "Ran a 2-bit or lower quant of a giant model and called it usable" },
  { id: 51, text: "Ran DeepSeek R1 671B locally, at any speed", joke: "0.8 tokens per second. Worth it." },
  { id: 52, text: "Ran a model at under 1 token/sec and called it fine", joke: { kind: "slow", text: "This is fine." } },
  { id: 53, text: "Have 1TB+ of model weights on disk", joke: "And you've used 3 of them." },
  { id: 54, text: "Ran out of disk space mid-download" },
  { id: 55, text: 'Asked a model how many r\'s are in "strawberry"', joke: "There are 2 r's in strawberry. —every model, 2024" },
  { id: 56, text: "Asked a model to draw an SVG of a pelican riding a bicycle", joke: { kind: "pelican" } },
  { id: 57, text: "Used an abliterated or uncensored model" },
  { id: 58, text: 'Downloaded a model with "-v2-final-fixed" in the name', joke: "-v2-final-fixed-REAL-use-this-one.gguf" },
  { id: 59, text: "Fine-tuned a LoRA", detect: "hf-lora" },
  { id: 60, text: "Fine-tuned with Unsloth on a free Colab" },
  { id: 61, text: "Merged models with mergekit", detect: "hf-merge" },
  { id: 62, text: "Uploaded a model to Hugging Face", detect: "hf-uploaded" },
  { id: 63, text: "Uploaded a GGUF to Hugging Face", detect: "hf-gguf" },
  { id: 64, text: "Your HF models have more downloads than you have followers", detect: "hf-downloads-beat-followers", joke: "Big on Hugging Face. Unknown at dinner." },
  { id: 65, text: 'Said "Qwen is cooking"', joke: "Qwen is always cooking." },
  { id: 66, text: "Ran gpt-oss locally and had opinions" },
  { id: 67, text: "Refreshed a Hugging Face org page waiting for a release" },
  { id: 68, text: "Lurked r/LocalLLaMA every day" },
  { id: 69, text: "Posted your rig on r/LocalLLaMA" },
  { id: 70, text: 'Commented "GGUF when?"', joke: "Soon™." },
  { id: 71, text: 'Asked "will it run on my 8GB card?"', joke: "It will not." },
  { id: 72, text: 'Said "not your weights, not your model"' },
  { id: 73, text: "Starred llama.cpp on GitHub", detect: "gh-starred-llamacpp" },
  { id: 74, text: "Opened an issue on llama.cpp, Ollama, or vLLM", detect: "gh-issue" },
  { id: 75, text: "Got a PR merged into llama.cpp, Ollama, or vLLM", detect: "gh-merged-pr", joke: "Respect. Genuinely." },
  { id: 76, text: "Followed Georgi Gerganov on X" },
  { id: 77, text: 'Watched a "run DeepSeek locally in 5 minutes" YouTube video', joke: "It took 5 hours." },
  { id: 78, text: "Stopped using the existing recipes and started cooking your own on a DGX Spark", joke: "The full arc." },
  { id: 79, text: "Stopped trusting benchmarks after a model you loved scored badly" },
  { id: 80, text: "Plugged your idle Mac into Darkbloom while you slept", joke: "Your Mac has a side hustle now." },
  { id: 81, text: "Explained quantization to a non-tech friend at dinner", joke: "They did not ask for a second dinner." },
  { id: 82, text: 'Said "privacy" was the reason when it was really because it\'s cool' },
  { id: 83, text: "Still pay for ChatGPT, Claude, or Gemini", joke: "For comparison. Obviously." },
  { id: 84, text: "Spent more on hardware than you'd spend on APIs in 5 years", joke: "But you own it." },
  { id: 85, text: "Your electricity bill went up enough to notice" },
  { id: 86, text: "Heated a room with your GPUs in winter", joke: "Not a bug. A feature." },
  { id: 87, text: "Someone you live with complained about the fan noise", joke: "It's white noise. It helps them sleep." },
  { id: 88, text: "Named your rig" },
  { id: 89, text: 'Said "I\'ll just run it locally" about what became a 3-weekend project' },
  { id: 90, text: "Ran a local model on a plane with no Wi-Fi and felt superior", joke: "The person in 14C did not care." },
  { id: 91, text: "Bought a second DGX Spark", detect: "hw-two-sparks", joke: "Then a third. It's fine." },
  { id: 92, text: "Have a model running right now", joke: "Which one? Be specific." },
  { id: 93, text: "Opened a terminal at a party to show someone your local model" },
  { id: 94, text: "Own 4 or more DGX Sparks", detect: "hw-four-sparks", joke: "Some people stopped at 3. Some people are building The All Spark." },
  { id: 95, text: 'Tweaked temperature and top_p to "fix" a model' },
  { id: 96, text: 'Have a folder named "models" and another named "models2"' },
  { id: 97, text: "Tried running a model bigger than your RAM with mmap and swap" },
  { id: 98, text: "Worried about your SSD's wear level" },
  { id: 99, text: "Bought hardware because of a single r/LocalLLaMA post" },
  { id: 100, text: "Took this test while a local model ran in the background", joke: "Hi. 👋" },
];
