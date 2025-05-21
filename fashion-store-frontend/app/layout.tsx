import type React from "react"
import { Inter } from "next/font/google"
import { ConfigProvider } from "antd"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Fashion Store - Online Clothing Shop",
  description: "Buy the latest fashion trends online",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#f5222d",
                borderRadius: 4,
              },
            }}
          >
            {children}
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
