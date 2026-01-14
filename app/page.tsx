"use client"

import dynamic from "next/dynamic"
import { BrowserRouter } from "react-router-dom"

// Dynamically import the Vite Index page to avoid SSR issues with react-router-dom
const IndexPage = dynamic(() => import("@/pages/Index"), { ssr: false })

export default function Page() {
  return (
    <BrowserRouter>
      <IndexPage />
    </BrowserRouter>
  )
}
