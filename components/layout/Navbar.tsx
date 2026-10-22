import Link from "next/link"

const Navbar = () => {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
      <Link href="/" className="text-2xl font-black tracking-tight">
        القعدة
      </Link>

      <nav className="hidden items-center gap-8 text-sm font-bold md:flex">
        <Link href="/about" className="transition-opacity hover:opacity-60">
          عن القعدة
        </Link>

        <Link href="/changelog" className="transition-opacity hover:opacity-60">
          التحديثات
        </Link>

        <Link href="/download" className="transition-opacity hover:opacity-60">
          التحميل
        </Link>

        <Link href="/feedback" className="transition-opacity hover:opacity-60">
          الملاحظات
        </Link>
      </nav>

      <Link
        href="/download"
        className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper transition-transform hover:-translate-y-0.5"
      >
        ابدأ قعدة
      </Link>
    </header>
  )
}

export default Navbar
