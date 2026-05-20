'use client';

import React, { useState } from 'react';
import { 
  Wallet, CreditCard, TrendingUp, ArrowRightLeft,
  ShoppingBag, Coffee, Home as HomeIcon, Plus,
  PiggyBank, LogOut, Target, X
} from 'lucide-react';
import { logout } from './login/actions';
import { addExpenseAction } from './actions';

import { createClient } from '@/utils/supabase/client';

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  // Fetch real bank accounts on load
  React.useEffect(() => {
    async function loadBanks() {
      const supabase = createClient();
      const { data } = await supabase.from('bank_accounts').select('*');
      if (data) setBankAccounts(data);
    }
    loadBanks();
  }, []);

  // Mock Data for UI (This would be fetched from Supabase in a real scenario)
  const stats = { totalMonth: 124500, personal: 45000, shared: 79500 };
  const balance = { owedToYou: 15000, whoOwes: "Tu Pareja" };
  const recentTransactions = [
    { id: 1, desc: 'Supermercado', amount: 45000, category: 'Comida', type: 'Compartido', date: 'Hoy', icon: ShoppingBag },
    { id: 2, desc: 'Internet', amount: 25000, category: 'Hogar', type: 'Compartido', date: 'Ayer', icon: HomeIcon },
  ];
  const savingsGoals = [
    { id: 1, name: 'Viaje a Japón', target: 5000000, current: 1200000 },
  ];

  async function handleAddExpense(formData: FormData) {
    try {
      await addExpenseAction(formData);
      setIsModalOpen(false);
      alert('Gasto agregado exitosamente (recarga la página para ver los cambios si estuviera conectado a DB real)');
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-12 lg:px-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, <span className="text-gradient">Alex</span></h1>
          <p className="text-zinc-400 mt-1">Aquí está el resumen de tus finanzas</p>
        </div>
        <div className="flex items-center gap-4">
          <form action={logout}>
            <button className="h-10 w-10 rounded-full glass-panel flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <LogOut size={18} />
            </button>
          </form>
          <div className="h-12 w-12 rounded-full glass-panel flex items-center justify-center border-indigo-500/30 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Avatar" className="h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Stats Area - 2 columns on lg */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Card */}
          <section className="glass-panel p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl group-hover:bg-indigo-500/30 transition-all duration-500"></div>
            
            <div className="flex items-center gap-3 text-indigo-400 mb-2">
              <Wallet size={20} />
              <h2 className="font-medium tracking-wide text-sm uppercase">Gasto Total del Mes</h2>
            </div>
            <div className="text-5xl font-bold tracking-tight text-white mb-8">
              ${stats.totalMonth.toLocaleString()}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-zinc-400 text-sm mb-1">Mis Personales</p>
                <p className="text-xl font-semibold text-white">${stats.personal.toLocaleString()}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="text-zinc-400 text-sm mb-1">Compartidos</p>
                <p className="text-xl font-semibold text-white">${stats.shared.toLocaleString()}</p>
              </div>
            </div>
          </section>

          {/* Bank Accounts Section (NEW) */}
          <section className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2"><CreditCard size={18} className="text-indigo-400"/> Cuentas Bancarias</h3>
              <button className="text-sm text-indigo-400 hover:text-indigo-300">Añadir</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {bankAccounts.map(b => (
                <div key={b.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-zinc-400 text-sm">{b.name}</p>
                  <p className={`text-lg font-semibold ${b.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                    ${b.balance.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar / Quick Actions */}
        <div className="space-y-6">
          <section className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 p-4 rounded-xl transition-colors border border-indigo-500/20">
                <Plus size={24} />
                <span className="text-xs font-medium text-center">Nuevo Gasto</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 p-4 rounded-xl transition-colors border border-blue-500/20">
                <PiggyBank size={24} />
                <span className="text-xs font-medium text-center">Ahorrar</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* MODAL NUEVO GASTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Plus size={20} className="text-indigo-400"/> Registrar Gasto</h2>
            
            <form action={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Monto ($)</label>
                  <input name="amount" type="number" required className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500" placeholder="15000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Categoría</label>
                  <select name="category" required className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500">
                    <option value="Comida">Comida</option>
                    <option value="Hogar">Hogar</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Ocio">Ocio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Descripción</label>
                <input name="description" type="text" required className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500" placeholder="Supermercado" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Cuenta Bancaria</label>
                  <select name="bank_account_id" className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500">
                    {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Tipo de Gasto</label>
                  <select name="split_type" required className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500">
                    <option value="50/50">Compartido (50/50)</option>
                    <option value="100%_personal">100% Personal</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-medium transition-colors mt-6">
                Guardar Gasto
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
