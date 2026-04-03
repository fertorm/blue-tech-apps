import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Disable Vercel's automatic body parsing — we need raw bytes for HMAC
export const config = { api: { bodyParser: false } }

// Admin client — uses service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks).toString("utf-8")
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // 1. Read raw body bytes (needed for correct HMAC verification)
  const rawBody = await getRawBody(req)

  // 2. Verify Lemon Squeezy webhook signature
  const signature = req.headers["x-signature"]
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  if (!secret) {
    console.error("[premium webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set")
    return res.status(500).json({ error: "Webhook secret not configured" })
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  if (signature !== expected) {
    console.error("[premium webhook] Invalid signature")
    return res.status(401).json({ error: "Invalid signature" })
  }

  // 3. Parse body after signature is verified
  let body
  try {
    body = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ error: "Invalid JSON" })
  }

  const { meta, data } = body

  // 4. Only handle order_created events
  if (meta?.event_name !== "order_created") {
    return res.status(200).json({ received: true, skipped: true })
  }

  // 5. Only activate on paid orders
  const status = data?.attributes?.status
  if (status !== "paid") {
    return res.status(200).json({ received: true, skipped: true })
  }

  // 6. Extract user_id from custom data
  const userId =
    meta?.custom_data?.user_id ||
    data?.attributes?.first_order_item?.checkout_custom?.user_id

  if (!userId) {
    console.error("[premium webhook] No user_id found in payload:", JSON.stringify(meta))
    return res.status(400).json({ error: "Missing user_id in custom data" })
  }

  // 7. Insert into premium_users
  const paymentRef = String(data?.id || "")
  const { error } = await supabaseAdmin
    .from("premium_users")
    .upsert({ user_id: userId, payment_ref: paymentRef })

  if (error) {
    console.error("[premium webhook] Supabase error:", error.message)
    return res.status(500).json({ error: "Database error" })
  }

  console.log(`[premium webhook] User ${userId} activated (ref: ${paymentRef})`)
  return res.status(200).json({ success: true })
}
