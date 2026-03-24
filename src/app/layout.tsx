import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Recipe Planner — Plan meals, shop smart, cook confidently",
  description: "A comprehensive meal planning platform that helps home cooks organize weekly menus, generate smart grocery lists, and discover recipes based on dietar",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>
}