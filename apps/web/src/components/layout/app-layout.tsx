import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTitles } from '@/features/titles/hooks'
import { useCurrentUser } from '@/features/auth/use-current-user'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui-store'
import { ReelIcon, Wordmark } from '../reel-logo'
import { ThemeToggleButton } from '../theme-toggle'
import { isNavActive, NAV_ITEMS } from './nav-items'
import { UserAvatar } from './user-avatar'

function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen)
  const toggle = useUiStore((s) => s.toggleSidebar)
  const { pathname } = useLocation()
  const user = useCurrentUser()
  const { data: titles } = useTitles()
  const watching = titles?.filter((t) => t.status === 'watching').length ?? 0
  const labelClass = cn('transition-opacity duration-250', open ? 'opacity-100' : 'opacity-0')

  return (
    <div className="sticky top-0 hidden h-screen shrink-0 py-4 pl-4 desk:block">
      <aside
        className="flex h-full flex-col gap-6 overflow-hidden rounded-[20px] border border-border bg-card px-3 py-5 shadow-fita transition-[width] duration-350 ease-[cubic-bezier(.4,0,.2,1)]"
        style={{ width: open ? 224 : 72 }}
      >
        <div className="flex h-[30px] items-center gap-2.5 px-2">
          <ReelIcon size={28} />
          <Wordmark className={cn('text-lg whitespace-nowrap', labelClass)} />
        </div>
        <nav className="flex flex-col gap-1" aria-label="Principal">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(item.to, pathname)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                title={item.label}
                className={cn(
                  'flex items-center gap-3 overflow-hidden rounded-xl px-3 py-[11px] text-[15px] font-medium whitespace-nowrap transition-colors hover:bg-secondary',
                  active ? 'bg-secondary text-primary hover:text-primary' : 'text-muted-foreground hover:text-muted-foreground',
                )}
              >
                <span className="grid shrink-0 place-items-center">{item.icon}</span>
                <span className={labelClass}>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          {user && (
            <div className="flex items-center gap-2.5 overflow-hidden px-1.5">
              <UserAvatar userId={user.id} image={user.image} size={34} />
              <div className={cn('text-sm leading-tight whitespace-nowrap', labelClass)}>
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{watching} assistindo</div>
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 px-1.5">
            <button
              type="button"
              onClick={toggle}
              title={open ? 'Recolher' : 'Expandir'}
              aria-label={open ? 'Recolher menu' : 'Expandir menu'}
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground hover:border-muted-foreground"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-350"
                style={{ transform: `rotate(${open ? 0 : 180}deg)` }}
                aria-hidden
              >
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <ThemeToggleButton />
          </div>
        </div>
      </aside>
    </div>
  )
}

function MobileHeader() {
  return (
    <header className="sticky top-0 z-5 flex items-center justify-between border-b border-border bg-background/85 px-[18px] py-3.5 backdrop-blur-md desk:hidden">
      <div className="flex items-center gap-2">
        <ReelIcon size={22} />
        <Wordmark className="text-base" />
      </div>
      <ThemeToggleButton className="size-[38px]" />
    </header>
  )
}

function MobileNav() {
  const { pathname } = useLocation()
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-3 bottom-3 z-5 flex justify-around rounded-[18px] border border-border bg-card/92 p-1.5 shadow-fita backdrop-blur-lg desk:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(item.to, pathname)
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={cn(
              'flex min-h-12 flex-1 flex-col items-center gap-[3px] px-1 py-1.5 text-[11px] font-semibold',
              active ? 'text-primary hover:text-primary' : 'text-muted-foreground hover:text-muted-foreground',
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="mx-auto box-border w-full max-w-[1240px] flex-1 px-4 pt-[18px] pb-24 desk:px-9 desk:pt-8 desk:pb-12">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
