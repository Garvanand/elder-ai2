import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import "./globals.css"

import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MemoryFriend",
  description: "A friendly companion to help remember what matters most",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = headers()
  const userAgent = headersList.get("user-agent") || ""
  const isNativeMobile = userAgent.includes("MemoryFriend-Mobile")

  return (
    <html lang="en">
      <body className={`${inter.className} antialiased ${isNativeMobile ? 'native-mobile' : ''}`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
