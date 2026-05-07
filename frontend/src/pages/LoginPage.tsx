import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

function formatApiError(err: unknown, fallback: string) {
  const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const m = data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join(', ');
  return fallback;
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<{ setupRequired: boolean }>('/auth/setup-status');
        if (!cancelled) setSetupRequired(data.setupRequired);
      } catch {
        if (!cancelled) setSetupRequired(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.accessToken);
      navigate('/');
    } catch (err) {
      setError(formatApiError(err, 'Credenciales inválidas'));
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/setup', {
        email,
        password,
        fullName: fullName.trim() || undefined,
      });
      setAuth(data.user, data.accessToken);
      setSetupRequired(false);
      navigate('/');
    } catch (err) {
      setError(formatApiError(err, 'No se pudo completar la instalación'));
    } finally {
      setLoading(false);
    }
  };

  if (setupRequired === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-lg border border-[var(--color-border)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">TaskFactory</h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
              {setupRequired ? 'Configuración inicial' : 'Gestión de producción'}
            </p>
          </div>

          {setupRequired ? (
            <form onSubmit={handleSetup} className="space-y-4">
              <p className="text-sm text-[var(--color-text-secondary)] rounded-xl bg-slate-50 px-4 py-3">
                No hay usuarios en el sistema. Cree la cuenta del administrador para continuar.
              </p>
              {error && (
                <div className="bg-red-50 text-[var(--color-accent-red)] text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Administrador"
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Confirmar contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Guardando...' : 'Crear administrador e ingresar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-[var(--color-accent-red)] text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
