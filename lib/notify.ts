/**
 * ProofDrop — Notifications layer (lib/notify.ts)
 *
 * One place for every outbound message (driver + customer) across channels:
 *   - SMS      via Twilio            (TWILIO_ACCOUNT_SID / AUTH_TOKEN / PHONE_NUMBER)
 *   - WhatsApp via Twilio WhatsApp   (TWILIO_WHATSAPP_NUMBER, falls back to PHONE_NUMBER)
 *   - Email    via Resend            (RESEND_API_KEY / EMAIL_FROM)
 *
 * Demo-friendly by design: when a channel is not configured, the message is
 * NOT dropped — it is recorded in the `notifications` table with status
 * "simulated" so the whole flow (and the dashboard "Outbox") stays visible
 * for demos and recruiters even without any provider keys.
 *
 * Every attempt — sent, simulated or failed — is logged to `notifications`
 * (needs migration 007 for the `channel` / `content` columns).
 */

import twilio from "twilio"
import { createAdminClient } from "@/lib/supabase/admin"

export type Channel = "sms" | "whatsapp" | "email"
export type SendStatus = "sent" | "simulated" | "failed"

export interface SendAttempt {
  channel: Channel
  recipient: string
  content: string
  status: SendStatus
  error?: string
}

// ---------------------------------------------------------------------------
// Message builders (pure functions — also used for the in-app previews)
// ---------------------------------------------------------------------------

export function buildDriverMessage(d: {
  customer_name: string
  customer_phone: string
  delivery_address?: string | null
  delivery_notes?: string | null
  product_name?: string | null
}, driverLink: string): string {
  const lines = [
    `📦 New delivery job`,
    ``,
    `👤 Customer: ${d.customer_name}`,
  ]
  if (d.delivery_address) lines.push(`📍 Address: ${d.delivery_address}`)
  if (d.product_name) lines.push(`🚚 Item: ${d.product_name}`)
  if (d.delivery_notes) lines.push(`📝 Notes: ${d.delivery_notes}`)
  lines.push(`📞 Customer phone: ${d.customer_phone}`)
  lines.push(``)
  lines.push(`After delivering, open this link on your phone to capture proof (photo + AI check):`)
  lines.push(driverLink)
  return lines.join("\n")
}

export function buildCustomerMessage(params: {
  business_name: string
  customer_name: string
  proof_link: string
}): string {
  return [
    `✅ ${params.customer_name}, your delivery from ${params.business_name} is confirmed!`,
    ``,
    `📸 View your delivery proof (photo + AI verification):`,
    params.proof_link,
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Phone helpers
// ---------------------------------------------------------------------------

export function normalizePhone(raw: string): string | null {
  if (!raw) return null
  const digits = raw.replace(/[^\d+]/g, "")
  if (digits.startsWith("+")) return digits
  const plain = digits.replace(/\D/g, "")
  if (plain.length === 10) return `+1${plain}` // default US
  if (plain.length === 11 && plain.startsWith("1")) return `+${plain}`
  if (plain.length >= 8) return `+${plain}` // already includes country code
  return null
}

// ---------------------------------------------------------------------------
// Channel senders (each falls back to "simulated" when unconfigured)
// ---------------------------------------------------------------------------

async function sendSMS(to: string, body: string): Promise<SendAttempt> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) {
    return { channel: "sms", recipient: to, content: body, status: "simulated" }
  }
  try {
    const client = twilio(sid, token)
    await client.messages.create({ body, from, to })
    return { channel: "sms", recipient: to, content: body, status: "sent" }
  } catch (err) {
    return {
      channel: "sms",
      recipient: to,
      content: body,
      status: "failed",
      error: err instanceof Error ? err.message : "SMS failed",
    }
  }
}

async function sendWhatsApp(to: string, body: string): Promise<SendAttempt> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) {
    return { channel: "whatsapp", recipient: to, content: body, status: "simulated" }
  }
  try {
    const client = twilio(sid, token)
    await client.messages.create({
      body,
      from: `whatsapp:${from}`,
      to: `whatsapp:${to}`,
    })
    return { channel: "whatsapp", recipient: to, content: body, status: "sent" }
  } catch (err) {
    return {
      channel: "whatsapp",
      recipient: to,
      content: body,
      status: "failed",
      error: err instanceof Error ? err.message : "WhatsApp failed",
    }
  }
}

async function sendEmail(to: string, subject: string, html: string, text: string): Promise<SendAttempt> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { channel: "email", recipient: to, content: `${subject}\n\n${text}`, status: "simulated" }
  }
  const from = process.env.EMAIL_FROM || "ProofDrop <onboarding@resend.dev>"
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    })
    if (!res.ok) {
      return {
        channel: "email",
        recipient: to,
        content: `${subject}\n\n${text}`,
        status: "failed",
        error: `Resend error ${res.status}`,
      }
    }
    return { channel: "email", recipient: to, content: `${subject}\n\n${text}`, status: "sent" }
  } catch (err) {
    return {
      channel: "email",
      recipient: to,
      content: `${subject}\n\n${text}`,
      status: "failed",
      error: err instanceof Error ? err.message : "Email failed",
    }
  }
}

// ---------------------------------------------------------------------------
// Logging into the notifications table (best-effort, never throws)
// ---------------------------------------------------------------------------

async function logAttempts(deliveryId: string, type: "driver" | "customer", attempts: SendAttempt[]) {
  try {
    const admin = createAdminClient()
    const rows = attempts.map((a) => ({
      delivery_id: deliveryId,
      type,
      channel: a.channel,
      recipient: a.recipient,
      content: a.content,
      status: a.status,
    }))
    if (rows.length) {
      await admin.from("notifications").insert(rows)
    }
  } catch (err) {
    // Notification logging must never break the delivery flow
    console.error("[notify] failed to log notifications:", err instanceof Error ? err.message : err)
  }
}

// ---------------------------------------------------------------------------
// High-level flows
// ---------------------------------------------------------------------------

export interface NotifyDelivery {
  id: string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  delivery_address?: string | null
  delivery_notes?: string | null
  product_name?: string | null
}

/** Called when a delivery is created — sends the capture link to the DRIVER. */
export async function notifyDriver(
  delivery: NotifyDelivery & { driver_phone?: string | null },
  driverLink: string,
  driverEmail?: string | null
): Promise<SendAttempt[]> {
  const attempts: SendAttempt[] = []
  const text = buildDriverMessage(delivery, driverLink)

  const phoneTarget = normalizePhone(delivery.driver_phone || "")
  if (phoneTarget) {
    attempts.push(await sendSMS(phoneTarget, text))
    attempts.push(await sendWhatsApp(phoneTarget, text))
  }
  if (driverEmail) {
    attempts.push(
      await sendEmail(
        driverEmail,
        "New delivery job — capture proof when delivered",
        driverEmailHtml(delivery, driverLink),
        text
      )
    )
  }

  if (!attempts.length) {
    // No driver contact info at all — still log what WOULD have been sent
    attempts.push({
      channel: "sms",
      recipient: delivery.driver_phone || "unassigned",
      content: text,
      status: "simulated",
    })
  }

  await logAttempts(delivery.id, "driver", attempts)
  return attempts
}

/** Called when a delivery is completed — sends the proof link to the CUSTOMER. */
export async function notifyCustomer(
  delivery: NotifyDelivery & { photo_url?: string | null },
  proofLink: string,
  businessName: string
): Promise<SendAttempt[]> {
  const attempts: SendAttempt[] = []
  const text = buildCustomerMessage({
    business_name: businessName,
    customer_name: delivery.customer_name,
    proof_link: proofLink,
  })

  const phone = normalizePhone(delivery.customer_phone)
  if (phone) {
    attempts.push(await sendSMS(phone, text))
    attempts.push(await sendWhatsApp(phone, text))
  }
  if (delivery.customer_email) {
    attempts.push(
      await sendEmail(
        delivery.customer_email,
        `Your delivery from ${businessName} is confirmed ✅`,
        customerEmailHtml(delivery, proofLink, businessName),
        text
      )
    )
  }

  await logAttempts(delivery.id, "customer", attempts)
  return attempts
}

// ---------------------------------------------------------------------------
// Email HTML templates (simple, inline-styled, dark-mode safe)
// ---------------------------------------------------------------------------

function driverEmailHtml(d: NotifyDelivery, driverLink: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#1e40af;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.8;">ProofDrop · New delivery job</p>
      <h1 style="margin:8px 0 0;font-size:20px;">Delivery for ${esc(d.customer_name)}</h1>
    </div>
    <div style="padding:24px;">
      ${row("Item", d.product_name)}
      ${row("Address", d.delivery_address)}
      ${row("Customer phone", d.customer_phone)}
      ${row("Notes", d.delivery_notes)}
      <a href="${driverLink}" style="display:block;margin-top:20px;background:#16a34a;color:#ffffff;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:bold;font-size:15px;">Open capture link</a>
      <p style="color:#64748b;font-size:12px;margin:16px 0 0;text-align:center;line-height:1.5;">
        Take a photo of the delivered item — our AI checks it instantly — and the customer is notified automatically.<br>${esc(driverLink)}
      </p>
    </div>
  </div></body></html>`
}

function customerEmailHtml(
  d: NotifyDelivery & { photo_url?: string | null },
  proofLink: string,
  businessName: string
): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:24px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#16a34a;color:#ffffff;padding:20px 24px;">
      <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;opacity:.8;">Delivery confirmed</p>
      <h1 style="margin:8px 0 0;font-size:20px;">${esc(d.customer_name)}, your delivery is complete</h1>
    </div>
    <div style="padding:24px;">
      ${d.photo_url ? `<img src="${esc(d.photo_url)}" alt="Delivery proof" style="width:100%;border-radius:12px;border:1px solid #e2e8f0;"/>` : ""}
      <p style="color:#334155;font-size:15px;line-height:1.6;margin:20px 0 4px;">
        ${esc(businessName)} delivered your item${d.product_name ? ` (${esc(d.product_name)})` : ""} and it passed AI photo verification.
      </p>
      <a href="${proofLink}" style="display:block;margin-top:16px;background:#1e40af;color:#ffffff;text-decoration:none;text-align:center;padding:14px;border-radius:12px;font-weight:bold;font-size:15px;">View your delivery proof</a>
      <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;text-align:center;">Delivered &amp; verified with ProofDrop</p>
    </div>
  </div></body></html>`
}

function esc(s?: string | null): string {
  if (!s) return ""
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function row(label: string, value?: string | null): string {
  if (!value) return ""
  return `<p style="margin:0 0 12px;"><span style="color:#94a3b8;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">${esc(label)}</span><br><span style="color:#0f172a;font-size:15px;">${esc(value)}</span></p>`
}
