import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
      <div className="w-full max-w-md glass-panel p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500"></div>

        <div className="relative z-10 text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Bienvenido</h1>
          <p className="text-zinc-400">Inicia sesión en tu cuenta familiar</p>
        </div>

        <form className="relative z-10 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="pt-4 grid grid-cols-2 gap-4">
            <button
              formAction={login}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-medium transition-all"
            >
              Iniciar Sesión
            </button>
            <button
              formAction={signup}
              className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 font-medium transition-all"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
