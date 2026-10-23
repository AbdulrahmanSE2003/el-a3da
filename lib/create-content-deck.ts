import { ContentItem as BaseContentItem } from "@/lib/content/types"

export interface ContentItem extends BaseContentItem {
  id: string
  text: string
}

export type ContentDeck<T extends ContentItem> = {
  next: () => T
  reset: (nextItems?: T[]) => void
  remaining: () => number
}

export const createContentDeck = <T extends ContentItem>(
  items: T[]
): ContentDeck<T> => {
  let source: T[] = items
  let deck: T[] = []
  let index = 0

  const shuffle = (items: T[]) => {
    const shuffled = [...items]

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))

      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled
  }

  const refill = () => {
    deck = shuffle(source)
    index = 0
  }

  refill()

  return {
    next: (): T => {
      if (index >= deck.length) {
        refill()
      }

      return deck[index++]
    },

    /**
     * إعادة البناء. بتمرير `nextItems` بتبدّل مصدر المحتوى — بتُستخدم
     * لما كاش المحلي يوفّر نسخة أحدث من البندل قبل بداية جلسة اللعب.
     */
    reset: (nextItems?: T[]) => {
      if (nextItems) source = nextItems
      refill()
    },

    remaining: () => deck.length - index,
  }
}
