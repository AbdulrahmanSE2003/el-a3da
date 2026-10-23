import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "القعدة — كل قعدة وليها حكاية",
    short_name: "القعدة",
    description: "تطبيق ويب مصري اجتماعي للشلة على القهوة أو في أي قعدة.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F0D0A",
    theme_color: "#0F0D0A",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
