import {
  CalendarClockIcon,
  DatabaseIcon,
  ListChecksIcon,
  Trash2Icon,
} from "lucide-react"
import { StatCard } from "../components/stat-card"
import { formatArabicTimeAgo, formatNumber } from "../lib/format"
import { OverviewData } from "../lib/types"

const StatsGrid = ({ data }: { data: OverviewData }) => {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
      <StatCard
        label="الأسئلة النشطة"
        value={formatNumber(data.totalLive)}
        icon={ListChecksIcon}
        detail={`تتضمن ${data.sets.length} مجموعات`}
      />
      <StatCard
        label="مؤرشفة مؤقتاً"
        value={formatNumber(data.totalDeleted)}
        icon={Trash2Icon}
        detail="مخفية من العرض المباشر"
        tone={data.totalDeleted > 0 ? "warn" : "default"}
      />
      <StatCard
        label="إجمالي الأسئلة"
        value={formatNumber(data.totalLive + data.totalDeleted)}
        icon={DatabaseIcon}
        detail="السجلات الكلية بجدول الأسئلة"
      />
      <StatCard
        label="آخر تحديث"
        value={
          data.lastContentUpdate
            ? formatArabicTimeAgo(data.lastContentUpdate)
            : "—"
        }
        icon={CalendarClockIcon}
        detail="تاريخ أحدث تعديل للعناصر النشطة"
      />
    </div>
  )
}

export default StatsGrid
