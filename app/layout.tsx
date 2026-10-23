import { Cairo, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Metadata, Viewport } from "next"
import UpdatePrompt from "@/components/ui/UpdatePropmt"
import { ContentSyncBootstrap } from "@/lib/content/sync-bootstrap"

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "700", "900"],
  variable: "--font-cairo",
  display: "swap",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "القعدة — كل قعدة وليها حكاية",
  description: "تطبيق ويب مصري اجتماعي للشلة على القهوة أو في أي قعدة.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "القعدة",
    startupImage: [
      {
        url: "/icon-512x512.png",
      },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: "#0F0D0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={cn(
        "antialiased selection:bg-primary/30 selection:text-foreground",
        cairo.variable,
        ibmPlexMono.variable
      )}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function () {
        try {
          var key = "qa3da-accent-theme";
          var theme = localStorage.getItem(key);
          var validThemes = [
            "cafe",
            "original-green",
            "night-blue",
            "ember-red",
            "velvet-purple"
          ];

          if (!validThemes.includes(theme)) {
            theme = "cafe";
          }

          document.documentElement.setAttribute(
            "data-accent-theme",
            theme
          );
        } catch (e) {}
      })();
    `,
          }}
        />
      </head>
      <body className="min-h-screen bg-paper font-sans text-foreground">
        <ThemeProvider>
          <ContentSyncBootstrap />
          <UpdatePrompt />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
