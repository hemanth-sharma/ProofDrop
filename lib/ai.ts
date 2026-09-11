/**
 * ProofDrop — AI photo verification (lib/ai.ts)
 *
 * Verifies that a driver-uploaded photo is valid proof of delivery.
 *
 * Two engines, chosen automatically:
 *   1. "llm"       — any OpenAI-compatible vision endpoint (OpenAI, GLM-4V,
 *                    OpenRouter, Ollama…). Configure with AI_API_KEY,
 *                    AI_BASE_URL (optional) and AI_MODEL (optional).
 *   2. "heuristic" — built-in offline image checks (valid decode, minimum
 *                    resolution, sharpness / blur detection). Always available,
 *                    zero external dependencies, so the demo flow works even
 *                    when no AI key is configured.
 *
 * AI_VERIFICATION_MODE: "auto" (default) | "llm" | "heuristic" | "off"
 */

import jpeg from "jpeg-js"

export type VerificationMode = "llm" | "heuristic"

export interface VerificationResult {
  verified: boolean
  confidence: number // 0..1
  reason: string // human-readable, shown to the driver
  mode: VerificationMode
}

export interface VerificationContext {
  customerName?: string | null
  address?: string | null
  notes?: string | null
  productName?: string | null
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export function resolveMode(): "llm" | "heuristic" | "off" {
  const configured = (process.env.AI_VERIFICATION_MODE || "auto").toLowerCase()
  if (configured === "off" || configured === "llm" || configured === "heuristic") {
    return configured
  }
  // auto
  return process.env.AI_API_KEY ? "llm" : "heuristic"
}

function llmConfig() {
  const apiKey = process.env.AI_API_KEY
  if (!apiKey) return null
  return {
    apiKey,
    baseUrl: (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.AI_MODEL || "gpt-4o-mini",
  }
}

// ---------------------------------------------------------------------------
// Prompt construction + response parsing (pure functions, unit-testable)
// ---------------------------------------------------------------------------

export function buildVerificationPrompt(ctx: VerificationContext): string {
  const lines = [
    "You are the photo verification assistant for ProofDrop, a proof-of-delivery service.",
    "A delivery driver just uploaded a photo as proof that an item was delivered to a customer.",
    "",
    "Delivery context:",
    `- Customer: ${ctx.customerName || "not provided"}`,
    `- Address: ${ctx.address || "not provided"}`,
    `- Item: ${ctx.productName || "not specified"}`,
    `- Notes: ${ctx.notes || "none"}`,
    "",
    "Decide whether the photo is acceptable proof of delivery:",
    "1. Does it show a package, parcel, box, bag, bouquet, food order, or other deliverable item?",
    "2. Does it look like a genuine photo taken at a delivery location (doorstep, porch, hallway, reception, driveway, etc.) rather than a screenshot, a drawing, a meme, a random object, or an unrelated image?",
    "3. Is it clear and usable as evidence?",
    "",
    'Respond ONLY with compact JSON (no markdown, no extra text) in this exact shape:',
    '{"verified": true or false, "confidence": 0.0-1.0, "reason": "one short sentence"}',
    '"verified" = is the photo acceptable proof of delivery;',
    '"confidence" = how sure you are, 0.0 to 1.0;',
    '"reason" = one short human-readable sentence explaining the decision.',
  ]
  return lines.join("\n")
}

export function parseVerdict(raw: string): { verified: boolean; confidence: number; reason: string } | null {
  if (!raw) return null
  // Strip markdown fences / stray text around the JSON object
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    const obj = JSON.parse(text.slice(start, end + 1))
    if (typeof obj.verified !== "boolean") return null
    const confidence =
      typeof obj.confidence === "number" && isFinite(obj.confidence)
        ? Math.min(1, Math.max(0, obj.confidence > 1 ? obj.confidence / 100 : obj.confidence))
        : 0.75
    const reason =
      typeof obj.reason === "string" && obj.reason.trim() ? obj.reason.trim().slice(0, 280) : "Photo reviewed by AI"
    return { verified: obj.verified, confidence, reason }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Engine 1: OpenAI-compatible vision LLM
// ---------------------------------------------------------------------------

async function verifyWithLLM(
  imageBase64: string,
  mimeType: string,
  ctx: VerificationContext
): Promise<VerificationResult | null> {
  const cfg = llmConfig()
  if (!cfg) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30_000)

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 300,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildVerificationPrompt(ctx) },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      console.error("[ai] LLM verification failed:", res.status, await res.text().catch(() => ""))
      return null
    }
    const data = await res.json()
    const content: string | undefined = data?.choices?.[0]?.message?.content
    const verdict = parseVerdict(content || "")
    if (!verdict) return null
    return { ...verdict, mode: "llm" }
  } catch (err) {
    console.error("[ai] LLM verification error:", err instanceof Error ? err.message : err)
    return null
  } finally {
    clearTimeout(timeout)
  }
}

// ---------------------------------------------------------------------------
// Engine 2: offline heuristic checks (always available)
// ---------------------------------------------------------------------------

const MIN_SIDE = 320 // px — smaller than this is not a usable proof photo
const MIN_BYTES = 6 * 1024 // 6 KB — below this it's not a real camera photo

export function heuristicVerify(buffer: Buffer, mimeType: string): VerificationResult {
  const checks: string[] = []

  // 1) Basic file sanity
  if (buffer.length < MIN_BYTES) {
    return {
      verified: false,
      confidence: 0.9,
      reason: "The uploaded file is too small to be a real photo.",
      mode: "heuristic",
    }
  }

  // 2) Parse dimensions (JPEG SOF markers / PNG IHDR)
  const dims = readDimensions(buffer)
  if (dims && Math.min(dims.width, dims.height) < MIN_SIDE) {
    return {
      verified: false,
      confidence: 0.85,
      reason: `Image resolution is too low (${dims.width}x${dims.height}px) for a valid proof photo.`,
      mode: "heuristic",
    }
  }
  if (dims) checks.push(`${dims.width}x${dims.height}px`)

  // 3) Sharpness (blur detection) — only for decodable JPEGs
  const sharpness = estimateSharpness(buffer)
  if (sharpness !== null) {
    if (sharpness < 12) {
      return {
        verified: false,
        confidence: 0.8,
        reason: "The photo looks too blurry to be used as delivery evidence. Please retake it.",
        mode: "heuristic",
      }
    }
    checks.push("sharpness ok")
  }

  return {
    verified: true,
    confidence: 0.8,
    reason: `Passed offline photo checks${checks.length ? ` (${checks.join(", ")})` : ""}.`,
    mode: "heuristic",
  }
}

/** Reads image dimensions straight from JPEG/PNG headers (no full decode). */
export function readDimensions(buf: Buffer): { width: number; height: number } | null {
  // PNG
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  // JPEG: walk segments to the first SOF marker
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) break
      const marker = buf[i + 1]
      const isSOF =
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      if (isSOF) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      }
      const len = buf.readUInt16BE(i + 2)
      if (len <= 0) break
      i += 2 + len
    }
  }
  return null
}

/** Variance-of-Laplacian on a downsampled grayscale grid. Null = not decodable. */
function estimateSharpness(buf: Buffer, gridSize = 160): number | null {
  try {
    const jpegBuffer = jpeg.decode(buf, { useTArray: true, maxMemoryUsageInMB: 512 })
    if (!jpegBuffer || !jpegBuffer.width || !jpegBuffer.height) return null
    const { width: w, height: h, data } = jpegBuffer
    if (w < 8 || h < 8) return null

    // Sample grayscale values on a grid
    const gw = Math.min(gridSize, w)
    const gh = Math.min(gridSize, h)
    const gray: number[][] = []
    for (let gy = 0; gy < gh; gy++) {
      const row: number[] = []
      const y = Math.floor((gy / gh) * h)
      for (let gx = 0; gx < gw; gx++) {
        const x = Math.floor((gx / gw) * w)
        const idx = (y * w + x) * 4
        row.push(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
      }
      gray.push(row)
    }

    // Laplacian variance
    const lap: number[] = []
    for (let y = 1; y < gh - 1; y++) {
      for (let x = 1; x < gw - 1; x++) {
        const v =
          4 * gray[y][x] - gray[y - 1][x] - gray[y + 1][x] - gray[y][x - 1] - gray[y][x + 1]
        lap.push(v)
      }
    }
    if (!lap.length) return null
    const mean = lap.reduce((a, b) => a + b, 0) / lap.length
    const variance = lap.reduce((a, b) => a + (b - mean) * (b - mean), 0) / lap.length
    return Math.sqrt(variance) // RMS of Laplacian — higher = sharper
  } catch {
    return null // e.g. HEIC/PNG — skip sharpness, other checks still apply
  }
}

// ---------------------------------------------------------------------------
// Public entrypoint
// ---------------------------------------------------------------------------

export async function verifyDeliveryPhoto(
  imageBuffer: Buffer,
  mimeType: string,
  ctx: VerificationContext
): Promise<VerificationResult> {
  const mode = resolveMode()

  if (mode === "off") {
    return { verified: true, confidence: 1, reason: "AI verification disabled", mode: "heuristic" }
  }

  if (mode === "llm") {
    const base64 = imageBuffer.toString("base64")
    const result = await verifyWithLLM(base64, mimeType || "image/jpeg", ctx)
    if (result) return result
    // LLM configured but failed — fall through to offline checks so the
    // driver is never blocked by an outage
    const fallback = heuristicVerify(imageBuffer, mimeType)
    return {
      ...fallback,
      reason: `${fallback.reason} (AI service was unreachable — used offline checks)`,
    }
  }

  return heuristicVerify(imageBuffer, mimeType)
}
