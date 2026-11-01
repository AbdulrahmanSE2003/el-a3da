/**
 * تفضيلات الصوت في القعدة.
 *
 * تفضيل واحد للمؤثرات الصوتية، يُخزَّن في localStorage بمفتاح خاص:
 * المؤثرات الصوتية (قلب الكروت، الفوز، دوران العجلة) — مفتاح: qa3da-sound-effects-muted
 *
 * ملاحظة: المفتاح القديم qa3da-sound-muted يُهاجر إلى تفضيل المؤثرات
 * الصوتية عند أول تحميل، ثم يُحذف بحيث لا تُفقد تفضيلات المستخدمين القدامى.
 */

// --- Sound Effects preference ---
const SFX_STORAGE_KEY = "qa3da-sound-effects-muted"
// --- Legacy key for one-time migration ---
const LEGACY_STORAGE_KEY = "qa3da-sound-muted"

let sfxMuted = false
const sfxListeners = new Set<(muted: boolean) => void>()

function load() {
  if (typeof localStorage === "undefined") return

  // Migration: إذا كان المفتاح القديم موجودًا، تُستخدم قيمته لتفضيل المؤثرات
  // الصوتية فقط، ثم يُحذف المفتاح القديم.
  let legacyRaw: string | null = null
  try {
    legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
  } catch {
    // localStorage غير متاح
  }

  if (legacyRaw !== null) {
    sfxMuted = legacyRaw === "true"
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      // تجاهل
    }
  } else {
    try {
      const raw = localStorage.getItem(SFX_STORAGE_KEY)
      if (raw !== null) sfxMuted = raw === "true"
    } catch {
      // تجاهل
    }
  }
}

function saveSfx() {
  if (typeof localStorage === "undefined") return
  try {
    localStorage.setItem(SFX_STORAGE_KEY, String(sfxMuted))
  } catch {
    // تجاهل
  }
}

/** هل المؤثرات الصوتية مكتومة حاليًا؟ */
export function isSoundEffectsMuted(): boolean {
  return sfxMuted
}

/** ضبط حالة كتم المؤثرات الصوتية وإبلاغ المستمعين. */
export function setSoundEffectsMuted(next: boolean): void {
  if (next === sfxMuted) return
  sfxMuted = next
  saveSfx()
  for (const listener of sfxListeners) {
    try {
      listener(sfxMuted)
    } catch {
      // فشل مستمع واحد لا يجب أن يوقف البقية.
    }
  }
}

/** التبديل بين تشغيل وكتم المؤثرات الصوتية. */
export function toggleSoundEffectsMuted(): void {
  setSoundEffectsMuted(!sfxMuted)
}

/** الاشتراك في تغييرات كتم المؤثرات الصوتية. ترجع دالة إلغاء الاشتراك. */
export function subscribeToSoundEffectsMute(
  listener: (muted: boolean) => void
): () => void {
  sfxListeners.add(listener)
  return () => {
    sfxListeners.delete(listener)
  }
}

load()
