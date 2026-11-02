import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3" aria-busy="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-md border-2 border-ink/10 bg-paper p-4",
            index === 8 && "col-span-2"
          )}
        >
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}
