'use client';

import React from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  ArrowRightLeft,
  ShoppingBag,
  Coffee,
  Home as HomeIcon,
  Plus,
  PiggyBank,
  LogOut,
  Target
} from 'lucide-react';
import { logout } from './login/actions';

export default function Dashboard() {
  // Mock Data for Expenses
  const stats = {
    totalMonth: 124500,
    personal: 45000,
    shared: 79500
  };

  const balance = {
    owedToYou: 15000,
    whoOwes: "Tu Pareja" 
  };

  const recentTransactions = [
    { id: 1, desc: 'Supermercado', amount: 45000, category: 'Comida', type: 'Compartido', date: 'Hoy', icon: ShoppingBag },
    { id: 2, desc: 'Internet', amount: 25000, category: 'Hogar', type: 'Compartido', date: 'Ayer', icon: HomeIcon },
    { id: 3, desc: 'Café', amount: 3500, category: 'Personal', type: 'Personal', date: 'Ayer', icon: Coffee },
  ];

  // Mock Data for Savings
  const savingsGoals = [
    { id: 1, name: 'Viaje a Japón', target: 5000000, current: 1200000 },
    { id: 2, name: 'Fondo de Emergencia', target: 1000000, current: 850000 },
  ];

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
            <button className="h-10 w-10 rounded-full glass-panel flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Cerrar sesión">
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

          {/* Savings Section (NEW) */}
          <section className="glass-panel p-6 bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border-blue-500/20">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 text-blue-400">
                <PiggyBank size={20} />
                <h3 className="font-semibold">Metas de Ahorro</h3>
              </div>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                <Plus size={14} /> Nueva Meta
              </button>
            </div>
            
            <div className="space-y-5">
              {savingsGoals.map((goal) => {
                const progress = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={goal.id} className="relative">
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          <Target size={14} className="text-blue-400" />
                          {goal.name}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          ${goal.current.toLocaleString()} de ${goal.target.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-blue-400">{progress.toFixed(0)}%</p>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Gastos Recientes</h3>
              <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                Ver todos <ArrowRightLeft size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                      <tx.icon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{tx.desc}</p>
                      <p className="text-xs text-zinc-500">{tx.category} • {tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">-${tx.amount.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">{tx.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar / Balance */}
        <div className="space-y-6">
          
          {/* Balance Card */}
          <section className="glass-panel p-6 bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border-indigo-500/20">
            <div className="flex items-center gap-2 text-purple-400 mb-6">
              <TrendingUp size={20} />
              <h3 className="font-medium">Balance de Pareja</h3>
            </div>
            
            <div className="text-center py-6">
              <p className="text-sm text-zinc-400 mb-2">{balance.whoOwes} te debe</p>
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                ${balance.owedToYou.toLocaleString()}
              </div>
            </div>
            
            <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 text-sm font-medium transition-all flex items-center justify-center gap-2">
              <CreditCard size={16} />
              Saldar Deuda
            </button>
          </section>

          {/* Quick Actions */}
          <section className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 p-4 rounded-xl transition-colors border border-indigo-500/20">
                <Plus size={24} />
                <span className="text-xs font-medium text-center">Nuevo Gasto</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 p-4 rounded-xl transition-colors border border-blue-500/20">
                <PiggyBank size={24} />
                <span className="text-xs font-medium text-center">Ahorrar</span>
              </button>
            </div>
            
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-400 text-center">
              💡 Tip: Envía <strong className="text-white">"50000 Ahorro Viaje Ahorros Compartido"</strong> al bot de Telegram.
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
