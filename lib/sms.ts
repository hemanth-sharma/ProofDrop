import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

function getClient() {
  if (!accountSid || !authToken) return null
  return twilio(accountSid, authToken)
}

export async function sendDriverSMS(params: {
  customer_name: string
  customer_phone: string
  driver_link: string
}): Promise<string | null> {
  const client = getClient()
  if (!client || !fromNumber) {
    return "Twilio not configured"
  }
  const to = params.customer_phone.replace(/\D/g, "").replace(/^(\d{10})$/, "+1$1")
  if (!to.startsWith("+")) {
    return "Invalid phone number"
  }
  try {
    await client.messages.create({
      body: `📦 Delivery for ${params.customer_name}: ${params.driver_link}`,
      from: fromNumber,
      to,
    })
    return null
  } catch (err: unknown) {
    return err instanceof Error ? err.message : "SMS failed"
  }
}

export async function sendCustomerSMS(params: {
  business_name: string
  customer_phone: string
  proof_link: string
}): Promise<string | null> {
  const client = getClient()
  if (!client || !fromNumber) {
    return "Twilio not configured"
  }
  const to = params.customer_phone.replace(/\D/g, "").replace(/^(\d{10})$/, "+1$1")
  if (!to.startsWith("+")) {
    return "Invalid phone number"
  }
  try {
    await client.messages.create({
      body: `✅ Your delivery from ${params.business_name} is complete! View proof: ${params.proof_link}`,
      from: fromNumber,
      to,
    })
    return null
  } catch (err: unknown) {
    return err instanceof Error ? err.message : "SMS failed"
  }
}
