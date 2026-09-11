import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/next"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ProofDrop — AI-Verified Proof of Delivery",
  description:
    "Send drivers a link, they snap a photo, AI verifies it, and customers get instant proof. No app required.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={plusJakarta.className}>
        {children}
        <Analytics />
        </body>
    </html>
  )
}
