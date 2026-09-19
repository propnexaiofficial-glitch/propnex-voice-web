import { GEMINI_API_KEYS } from './src/lib/gemini-keys';

async function listModels() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEYS[0]}`);
  const data = await res.json();
  const names = data.models.map((m: any) => m.name).filter((n: string) => n.includes("gemini") && n.includes("flash"));
  console.log("AVAILABLE FLASH MODELS:");
  console.log(names.join("\n"));
}

listModels();
