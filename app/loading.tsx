import { Loader } from "lucide-react"

interface LoadingProps {
  label?: string
}

export default function Loading({
  label = "ثواني بنجهّز القعدة...",
}: LoadingProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <Loader className="size-8 animate-spin text-ink-glow" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
