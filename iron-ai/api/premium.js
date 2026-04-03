// api/premium.js
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

// Admin client — uses service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  // 1. Verify Lemon Squeezy webhook signature
  const rawBody = JSON.stringify(req.body)
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

  // 2. Only handle order_created events
  const { meta, data } = req.body
  if (meta?.event_name !== "order_created") {
    return res.status(200).json({ received: true, skipped: true })
  }

  // 3. Only activate on paid orders
  const status = data?.attributes?.status
  if (status !== "paid") {
    return res.status(200).json({ received: true, skipped: true })
  }

  // 4. Extract user_id from custom data
  // Lemon Squeezy sends custom data in meta.custom_data
  const userId =
    meta?.custom_data?.user_id ||
    data?.attributes?.first_order_item?.checkout_custom?.user_id

  if (!userId) {
    console.error("[premium webhook] No user_id found in payload:", JSON.stringify(meta))
    return res.status(400).json({ error: "Missing user_id in custom data" })
  }

  // 5. Insert into premium_users
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
