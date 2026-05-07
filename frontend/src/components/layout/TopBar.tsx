import { Search, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

export function TopBar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-6">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search size={18} className="text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full bg-[var(--color-accent-blue-pale)] rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] border-0"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-[var(--color-accent-blue-pale)] transition-colors">
          <Bell size={20} className="text-[var(--color-text-secondary)]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-accent-red)] rounded-full" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-medium">
            {user?.fullName?.charAt(0) ?? 'U'}
          </div>
          <span className="text-sm font-medium hidden sm:block">{user?.fullName ?? 'Usuario'}</span>
        </div>
        <button
          onClick={logout}
          className="p-2 rounded-xl hover:bg-[var(--color-accent-blue-pale)] transition-colors"
          title="Cerrar sesión"
        >
          <LogOut size={18} className="text-[var(--color-text-secondary)]" />
        </button>
      </div>
    </header>
  );
}
