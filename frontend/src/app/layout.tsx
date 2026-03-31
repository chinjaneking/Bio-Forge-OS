import Script from 'next/script'
import type { Metadata } from 'next'
import { Providers } from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bio-Forge - Molecular Design Platform',
  description: 'Generative Biology Platform for Enzyme Engineering and Molecular Design'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
              <Script src="https://cdn.jsdelivr.net/npm/@nxcode/sdk@latest/dist/nxcode.min.js" strategy="beforeInteractive" />
      </body>
    </html>
  )
}
