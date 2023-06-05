import './globals.css'
import './styles/splash/splashloader.css'
import './styles/splash/splash.css'
import './styles/splash/splashbackground.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AppoFlex',
  description: 'App to help those with flexilizing appointments.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
