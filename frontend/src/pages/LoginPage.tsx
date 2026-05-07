import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/Button';
import api from '../lib/api';

function formatApiError(err: unknown, fallback: string) {
  if (err instanceof AxiosError) {
    const msg = err.response?.data?.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
    if (Array.isArray(msg) && msg.length > 0) return msg.join(', ');
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Sin conexión con el servidor o /api no enlaza al backend. Revise Dokploy y el dominio.';
    }
    const status = err.response?.status;
    if (status === 502 || status === 504) {
      return `El servidor intermedio respondió con error (${status}). Compruebe que el backend esté en ejecución.`;
    }
    if (status === 404) {
      return 'No existe la ruta de instalación en el servidor. Despliegue la última versión del backend.';
    }
    if (status) return `${fallback} (HTTP ${status})`;
  }
  const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
  const m = data?.message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.join(', ');
  return fallback;
}

function readQueryParam(name: string): string | null {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function clearQueryParams(...names: string[]) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  let changed = false;
  for (const n of names) {
    if (url.searchParams.has(n)) {
      url.searchParams.delete(n);
      changed = true;
    }
  }
  if (changed) {
    const newUrl = `${url.pathname}${url.search ? url.search : ''}${url.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null);
  const [setupStatusFailed, setSetupStatusFailed] = useState(false);
  const [preferSetup, setPreferSetup] = useState(false);
  const [workosEnabled, setWorkosEnabled] = useState<boolean>(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get<{ setupRequired: boolean }>('/auth/setup-status');
        if (!cancelled) {
          setSetupRequired(data.setupRequired);
          setSetupStatusFailed(false);
        }
      } catch {
        if (!cancelled) {
          setSetupRequired(false);
          setSetupStatusFailed(true);
        }
      }
    })();
    (async () => {
      try {
        const { data } = await api.get<{ enabled: boolean }>('/auth/workos/status');
        if (!cancelled) setWorkosEnabled(!!data.enabled);
      } catch {
        if (!cancelled) setWorkosEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tokenFromUrl = readQueryParam('token');
    const errorFromUrl = readQueryParam('error');
    if (errorFromUrl) {
      setError(decodeURIComponent(errorFromUrl));
      clearQueryParams('token', 'error');
      return;
    }
    if (!tokenFromUrl) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        localStorage.setItem('token', tokenFromUrl);
        const { data: user } = await api.get('/auth/me');
        if (cancelled) return;
        setAuth(user, tokenFromUrl);
        clearQueryParams('token', 'error');
        navigate('/');
      } catch (err) {
        localStorage.removeItem('token');
        clearQueryParams('token', 'error');
        if (!cancelled) setError(formatApiError(err, 'No se pudo iniciar sesión con WorkOS'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, setAuth]);

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

  const handleWorkosLogin = () => {
    const apiBase =
      (typeof window !== 'undefined' && window.__TASKFACTORY_API_BASE__) ||
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
      '/api';
    const base = apiBase.replace(/\/+$/, '');
    window.location.href = `${base}/auth/workos/login`;
  };

  if (setupRequired === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
        <p className="text-sm text-[var(--color-text-secondary)]">Cargando...</p>
      </div>
    );
  }

  const showSetupForm = setupRequired || preferSetup;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-main)]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-lg border border-[var(--color-border)] p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">TaskFactory</h1>
            <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
              {showSetupForm ? 'Configuración inicial' : 'Gestión de producción'}
            </p>
          </div>

          {showSetupForm ? (
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
              {!setupRequired && preferSetup && (
                <button
                  type="button"
                  onClick={() => {
                    setPreferSetup(false);
                    setError('');
                  }}
                  className="w-full text-sm text-[var(--color-text-secondary)] underline"
                >
                  Volver al inicio de sesión
                </button>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              {setupStatusFailed && (
                <div className="bg-amber-50 text-amber-900 text-sm rounded-xl px-4 py-3 space-y-2">
                  <p>No se pudo verificar si es la primera instalación (¿API o proxy?).</p>
                  <button
                    type="button"
                    onClick={() => setPreferSetup(true)}
                    className="font-medium text-[var(--color-primary)] underline"
                  >
                    Primera instalación: crear administrador
                  </button>
                </div>
              )}
              {error && (
                <div className="bg-red-50 text-[var(--color-accent-red)] text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {workosEnabled ? (
                <>
                  <Button
                    type="button"
                    onClick={handleWorkosLogin}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Conectando...' : 'Continuar con WorkOS'}
                  </Button>
                  <p className="text-xs text-[var(--color-text-secondary)] text-center">
                    El acceso se hace mediante WorkOS AuthKit (SSO, magic link o contraseña gestionada).
                  </p>
                </>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
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

              <button
                type="button"
                onClick={() => {
                  setPreferSetup(true);
                  setError('');
                }}
                className="w-full text-sm text-[var(--color-text-secondary)] underline"
              >
                Primera instalación (cuenta nueva en servidor vacío)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
