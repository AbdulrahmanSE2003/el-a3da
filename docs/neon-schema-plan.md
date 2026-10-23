# Neon — المخطط الفعلي والحالة الحالية

> **آخر تحديث: 2026-10-21.** المستند ده بيوصف اللي متطبّق فعليًا، مش خطة
> مستقبلية. المصدر الرسمي للمخطط هو `db/migrations/0001_init_schema.sql`،
> وبيانات المجموعات في `db/migrations/0002_seed_content_sets.sql`.

## 1. الحالة الحالية

| البند                   | الحالة                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| Neon project            | `el-a3da`                                                               |
| الفرع المستخدم للتطوير  | `dev`                                                                   |
| الفرع الافتراضي/الإنتاج | `production` — **فاضي، 0 جداول**                                        |
| المخطط                  | مُطبّق على `dev`                                                        |
| بيانات المحتوى          | **3,181 عنصرًا** كـ baseline استيراد 2026-10-21 (الأرقام الحالية قد تختلف) |
| عناصر محذوفة            | **0 عند الاستيراد**؛ الحذف الناعم اللاحق ممكن                          |
| feedback / notes        | `feedback` بيُكتب من `/feedback`، و`notes` فاضي ولسه مش معروض           |
| الداشبورد               | مصادقة مفعّلة؛ إضافة/تعديل/حذف ناعم للأسئلة، وتغيير حالة رسائل اللاعبين |

**مهم:** فرع `production` لم يُلمس. أي migration أو import مستقبلي لازم يتعمل
على `dev` أولًا، وبعد مراجعة منفصلة ومصرّح بها فقط يمكن التخطيط للإنتاج.

## 2. المعمارية الحالية

- **قاعدة البيانات:** Neon PostgreSQL serverless.
- **الوصول من Next.js:** `@neondatabase/serverless` داخل Server Components فقط.
- **طبقة الاستعلامات:** `features/admin/server/queries.ts` — فيها
  `import "server-only"`، وبتستدعي `connection()` قبل أي query عشان صفحات
  `/admin` تفضل request-time ومتتعملش prerender بأرقام قديمة.
- **المتغير المطلوب:** `DATABASE_URL` في `.env.local` (gitignored). القيمة
  نفسها **لا** تُكتب في المستودع ولا تُمرّر لأي Client Component.
- **الكتابة:** Server Actions محمية في
  `features/admin/server/question-actions.ts`، والكتابات نفسها في
  `question-mutations.ts`. كل استدعاء بيتحقق من جلسة المسؤول أولًا. التعديل
  محدود بحقول السؤال المسموحة، والحذف soft delete فقط. راجع
  `docs/admin-questions.md`.
- **عميل قاعدة البيانات:** `features/admin/server/db.ts` — ملف مشترك
  `server-only` بين القراءة والكتابة.

## 3. الجداول الفعلية

### 3.1 `content_sets` — 6 صفوف

| العمود       | النوع                  | ملاحظات                                                          |
| ------------ | ---------------------- | ---------------------------------------------------------------- |
| `id`         | `text` PK              | `casino`, `topics`, `challenges`, `sheikh`, `zad`, `punishments` |
| `name`       | `text` NOT NULL        | الاسم العربي المعروض                                             |
| `version`    | `bigint` NOT NULL      | توكن محتوى monotonic، مش عدد نشر                                 |
| `created_at` | `timestamptz` NOT NULL |                                                                  |
| `updated_at` | `timestamptz` NOT NULL |                                                                  |

`version` بيتحرّك بواسطة trigger `questions_bump_content_version` في نفس
الـ transaction اللي بتكتب تغيير محتوى حقيقي. العملاء بيقارنوا **التساوي**،
مش الترتيب؛ الـ bulk import ممكن ينقّل الرقم أكتر من واحد.

### 3.2 `questions` — 3,181 صفًا عند الاستيراد

| العمود           | النوع                         | ملاحظات                                          |
| ---------------- | ----------------------------- | ------------------------------------------------ |
| `id`             | `uuid` PK                     | `gen_random_uuid()`                              |
| `set_id`         | `text` FK → `content_sets.id` | `on delete restrict`                             |
| `external_id`    | `text` NOT NULL               | المعرّف الأصلي من `contents/*`؛ TEXT دائمًا      |
| `position`       | `integer` NOT NULL            | ترتيب المصدر من **0**؛ هو المرجع للعرض           |
| `text`           | `text` NOT NULL               |                                                  |
| `category`       | `text`                        | اختياري في `zad`، مطلوب فعليًا في باقي المجموعات |
| `correct_answer` | `text`                        | `casino` فقط                                     |
| `badge_label`    | `text`                        | `zad` فقط                                        |
| `created_at`     | `timestamptz` NOT NULL        |                                                  |
| `updated_at`     | `timestamptz` NOT NULL        |                                                  |
| `deleted_at`     | `timestamptz`                 | soft delete فقط                                  |

قيود مهمة:

- `unique (set_id, external_id)`.
- `unique (set_id, position)` — **deferrable initially deferred** عشان إعادة
  الترتيب الكاملة تقدر تحصل في transaction واحد.
- `position >= 0`، و`text`/`external_id` مش فاضيين.
- مفيش عمود `status` أو `is_active` أو `is_used`. العنصر إما حي أو
  `deleted_at` مش null.

### 3.3 `feedback`

| العمود                      | النوع                         | ملاحظات                                               |
| --------------------------- | ----------------------------- | ----------------------------------------------------- |
| `id`                        | `uuid` PK                     |                                                       |
| `type`                      | `text`                        | `bug` / `suggestion` / `question_issue` / `general`   |
| `status`                    | `text`                        | `open` / `reviewed` / `done` — بيتحدد من الداشبورد    |
| `priority`                  | `text`                        | `low` / `medium` / `high` — مشتق من النوع عند الإرسال |
| `message`                   | `text` NOT NULL               |                                                       |
| `rating`                    | `smallint`                    | 1–5 أو null                                           |
| `contact`                   | `text`                        | اختياري                                               |
| `set_id`                    | `text` FK → `content_sets.id` | `on delete set null`                                  |
| `question_external_id`      | `text`                        | مرجع loose، مش FK                                     |
| `app_version`               | `text`                        |                                                       |
| `device_info`               | `text`                        |                                                       |
| `created_at` / `updated_at` | `timestamptz`                 |                                                       |
| `reviewed_at`               | `timestamptz`                 | بيتسجل أول ما الحالة تخرج من `open`                   |
| `reviewed_by`               | `text`                        | مش FK — مفيش جدول `admin_users`                       |

### 3.4 `feedback_attachments`

| العمود             | النوع                     | ملاحظات                                   |
| ------------------ | ------------------------- | ----------------------------------------- |
| `id`               | `uuid` PK                 |                                           |
| `feedback_id`      | `uuid` FK → `feedback.id` | `on delete cascade`                       |
| `storage_key`      | `text` UNIQUE NOT NULL    | مفتاح الكائن، مش URL                      |
| `mime_type`        | `text`                    | `image/png` / `image/jpeg` / `image/webp` |
| `size_bytes`       | `bigint`                  | ≤ 5 MB                                    |
| `width` / `height` | `integer`                 | اختياري                                   |
| `created_at`       | `timestamptz`             |                                           |

ملفات الصور مش في Neon نفسها، هي في bucket `feedbacks` الخاص (Neon Object
Storage)، والكتابة بتحصل من `/api/feedback` بروابط موقّعة قصيرة العمر.

### 3.5 `notes` — 0 صفوف

| العمود                      | النوع                         | ملاحظات                                     |
| --------------------------- | ----------------------------- | ------------------------------------------- |
| `id`                        | `uuid` PK                     |                                             |
| `title`                     | `text` NOT NULL               |                                             |
| `body`                      | `text`                        | default `''`                                |
| `type`                      | `text`                        | `task` / `bug` / `improvement` / `reminder` |
| `priority`                  | `text`                        | `low` / `medium` / `high`                   |
| `status`                    | `text`                        | `todo` / `in_progress` / `done`             |
| `set_id`                    | `text` FK → `content_sets.id` | `on delete set null`                        |
| `due_date`                  | `date`                        | اختياري                                     |
| `pinned`                    | `boolean`                     | default `false`                             |
| `created_at` / `updated_at` | `timestamptz`                 |                                             |

### 3.6 جداول غير موجودة

- `admin_users`: **غير موجود**. المسؤول واحد، والمصادقة منفّذة عبر متغيرات
  بيئة وجلسة موقّعة — راجع `docs/admin-auth.md`.
- `content_revisions`: **غير موجودة**. سجل التعديلات لسه فكرة مستقبلية.

## 4. الفهارس والـ triggers

- `questions_live_position_idx` — `(set_id, position) where deleted_at is null`.
- `questions_category_idx` — `(set_id, category)`.
- `questions_deleted_at_idx` — `(deleted_at) where deleted_at is not null`.
- `feedback_status_created_idx` — `(status, created_at desc)`.
- `feedback_set_id_idx`.
- `feedback_attachments_feedback_id_idx`.
- `notes_status_due_date_idx`.
- `notes_set_id_idx`.
- `set_updated_at()` + trigger على كل جدول فيه `updated_at`.
- `bump_content_set_version()` + trigger
  `questions_bump_content_version` على `questions` (insert/update/delete).

## 5. بيانات `dev` عند الاستيراد الأول (2026-10-21)

> الأرقام دي هي baseline الاستيراد الأول، مش أرقام live مضمونة. إضافات/تعديلات/حذف
> ناعم من الداشبورد بتغيّرها. `pnpm content:verify` بيطبع الـ drift ويفشل على مشاكل
> السلامة فقط؛ `pnpm content:verify -- --strict` بيفشل على أي drift.

| المجموعة                 | العناصر الحية | المحذوفة | `version` | نطاق `position` |
| ------------------------ | ------------: | -------: | --------: | --------------- |
| `casino` / كافيه الألعاب |         1,094 |        0 |     1,095 | 0–1,093         |
| `topics` / مواضيع        |           502 |        0 |       503 | 0–501           |
| `challenges` / تحديات    |           500 |        0 |       501 | 0–499           |
| `sheikh` / شيخ الحارة    |           500 |        0 |       501 | 0–499           |
| `zad` / زاد القعدة       |            86 |        0 |        87 | 0–85            |
| `punishments` / عقوبات   |           499 |        0 |       500 | 0–498           |
| **الإجمالي**             |     **3,181** |    **0** |         — | —               |

ملاحظات على البيانات:

- كل صفوف الاستيراد الـ 3,181 ليهم UUID فريد، و`position` متسلسل من 0 داخل كل مجموعة عند الاستيراد.
- مفيش صفوف يتيمة أو `set_id` غير معروف.
- معرّفات الكازينو: **598** معرّف رقمي و**496** معرّف فيه suffix زي `1-2`.
  خريطة التغيير الكاملة محفوظة في
  `docs/migrations/casino-ids-2026-10-21.txt` (1,094 سطرًا).
- فيه **14 مجموعة نص مكرر** داخل الكازينو (28 سجلًا). التكرار جزء من المصدر
  الأصلي واتحفظ زي ما هو؛ مش خطأ ومش اتحذف أو اتدمج.
- 18 سجلًا في المصدر نصهم سطر واحد (topics 16؛ challenges 47 و463؛
  punishments 101، 112، 116، 121، 134، 148، 184، 186، 194، 196، 202،
  204، 226، 232، 306) — اتحفظوا زي ما هم.

## 6. الاستيراد والتحقق

- الاستيراد الأول اتعمل مرة واحدة على `dev` في transaction واحد باستخدام
  JSONB recordset chunks. **لم يُعاد تشغيله**.
- تمت مقارنة كل مصدر بـ DB على مستوى العدّ والحقول، وكل الـ manifests طابقت.
- مفيش truncate أو حذف جماعي أو إعادة ترقيم للمعرّفات أو تغيير للنصوص/الترتيب.
- سكربت الـ import كان أداة تشغيلية لمرة واحدة خارج المستودع؛ ملفات
  `db/migrations/` ما زالت schema/metadata فقط ومش بتضمّن الـ 3,181 صفًا عند الاستيراد.
- لو احتجت إعادة استيراد مستقبلًا: لازم يكون على فرع `dev`، وبمراجعة صريحة،
  ومن غير المساس بـ `production`.

## 7. ربط الداشبورد الحالي

| الصفحة             | المصدر                              | الحالة                                                                               |
| ------------------ | ----------------------------------- | ------------------------------------------------------------------------------------ |
| `/admin`           | `content_sets` + `questions`        | أرقام ونسخ حقيقية                                                                    |
| `/admin/questions` | `questions`                         | Server-side filtering + pagination (20/صفحة) + إضافة/تعديل/حذف ناعم                  |
| `/admin/health`    | `questions` + `content_sets`        | فحص حقيقي (نصوص/فئات/ترتيب/تكرار)                                                    |
| `/admin/feedback`  | `feedback` + `feedback_attachments` | فلترة بالنوع/الحالة/البحث + تغيير الحالة (مفتوحة/مقروءة/تم الحل) + صور موقّعة مؤقتًا |
| `/admin/notes`     | —                                   | **العرض غير مفعّل** (ملاحظات داخلية)                                                 |

- الترتيب دايمًا `position asc`، مش `external_id`.
- الفلترة والبحث والـ pagination بيتعملوا في SQL، والصفحة بتقرأ
  `searchParams` على السيرفر.
- مفيش mock data ولا حالة محلية بتُحفظ. الصفحات بتعرض loading/error/empty
  states حقيقية.
- الدخول محمي بجلسة مسؤول. إضافة سؤال جديد، تعديل حقوله، وحذفه soft delete
  متاحين من الواجهة، ورسائل اللاعبين متاحة مع تغيير حالتها؛ الحذف النهائي،
  الاستعادة، وأي publish workflow خارج النطاق الحالي.
- صفحات اللعب العامة بتقرأ من snapshot المحتوى (IndexedDB مع fallback إلى
  `contents/*.ts`)، وتعديلات الداشبورد على Neon بتظهر للجلسات الجديدة بعد المزامنة.

## 8. خارج النطاق حاليًا

- توسيع المصادقة لأكثر من مسؤول أو إدارة جلسات في قاعدة البيانات.
- حذف نهائي أو استعادة سؤال محذوف من الواجهة.
- أي كتابة على `notes` من الواجهة (feedback بيُكتب من صفحة اللاعبين).
- الرد على `feedback` من الداشبورد (تغيير الحالة متاح، لكن مفيش رد أو تعليق).
- أي publish workflow أو نشر تلقائي للإصدارات.
- تطبيق المخطط أو استيراد البيانات على `production`.
