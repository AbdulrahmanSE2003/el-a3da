import { ArrowRightIcon, CompassIcon, FileQuestionIcon } from "lucide-react"

import { StateLinkButton, StatePanel } from "@/components/ui/state-panel"

interface NotFoundProps {
  title?: string
  description?: string
  backLink?: string
  backLabel?: string
}

export default function NotFound({
  title = "الصفحة غير موجودة",
  description = "العنصر أو الصفحة التي تحاول الوصول إليها غير متاحة أو تم نقلها. اتأكد من الرابط أو ارجع للصفحة الرئيسية.",
  backLink = "/",
  backLabel = "العودة للرئيسية",
}: NotFoundProps) {
  return (
    <StatePanel
      variant="full"
      tone="copper"
      icon={FileQuestionIcon}
      stamp="404 NOT FOUND"
      title={title}
      description={description}
      actions={
        <>
          <StateLinkButton href={backLink} icon={ArrowRightIcon}>
            {backLabel}
          </StateLinkButton>
          {backLink !== "/" && (
            <StateLinkButton href="/" icon={CompassIcon}>
              الرئيسية
            </StateLinkButton>
          )}
        </>
      }
    />
  )
}
