import Link from 'next/link'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/create', label: 'Create' },
  { href: '/videos', label: 'Videos' },
]

export function AppShell({
  children,
  title,
  description,
  actions,
}: {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold tracking-tight">
              <span className="text-primary">Motioner</span>
            </Link>
            <div className="hidden text-sm text-muted-foreground md:block">
              Automated DevRel videos from PRs
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {(title || description || actions) && (
        <div className="mx-auto w-full max-w-6xl px-4 pt-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-muted-foreground md:text-base">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}

      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
