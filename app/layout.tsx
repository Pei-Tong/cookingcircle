import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'cooking_circle',
  description: 'Cooking Circle',
  generator: 'cooking_circle',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
