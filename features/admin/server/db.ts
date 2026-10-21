import "server-only"

/**
 * إعادة تصدير عميل قاعدة البيانات المشترك.
 *
 * الملف ده فضل موجود عشان imports الأدمن القديمة تفضل شغالة، بينما كود
 * الملاحظات بيستورد العميل من `lib/server/db` مباشرة.
 */
export { getSql } from "@/lib/server/db"
