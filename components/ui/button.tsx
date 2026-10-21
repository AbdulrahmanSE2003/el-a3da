import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui/slot"

const buttonVariants = cva(
  // Base styles: Layout, typography, Focus/Disabled states (بدون ألوان أو ظلال هنا)
  "inline-flex items-center justify-center gap-3 rounded-sm font-bold whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-copper/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // الزر الأساسي (نحاس + حبر)
        default:
          "border-2 border-ink bg-copper text-paper shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",

        // زر مفرغ (ورق + حبر)
        outline:
          "border-2 border-ink bg-paper text-ink shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-paper-warm hover:shadow-[2px_2px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",

        // زر ثانوي (لون البخار Steam)
        secondary:
          "border-2 border-ink bg-steam text-ink shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-ink)] hover:brightness-95 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",

        // زر بدون حدود (للنصوص فقط)
        ghost:
          "rounded-md text-ink-soft hover:bg-copper/10 hover:text-ink active:bg-copper/20",

        // زر الخطر/العقوبات
        destructive:
          "border-2 border-ink bg-danger-brand text-background shadow-[4px_4px_0px_0px_var(--color-ink)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_var(--color-ink)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        // رابط
        link: "text-copper underline-offset-4 hover:underline",
      },
      size: {
        // تم تكبير الأحجام لتناسب استخدام الموبايل والقعدة
        default: "h-12 px-6 text-lg [&_svg]:size-5",
        sm: "h-10 px-4 text-base [&_svg]:size-4",
        lg: "h-14 px-8 text-xl [&_svg]:size-6",
        icon: "size-12 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
