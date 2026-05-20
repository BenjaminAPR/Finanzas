'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, CreditCard, ArrowRightLeft,
  ShoppingBag, Home as HomeIcon, Plus,
  PiggyBank, LogOut, Landmark, X, Percent
} from 'lucide-react';
import { logout } from './login/actions';
import { addExpenseAction, addDebtAction, payDebtAction } from './actions';
import { createClient } from '@/utils/supabase/client';

export default function WalletDashboard() {
  const [activeTab, setActiveTab] = useState<'billetera' | 'deudas' | 'ahorros'>('billetera');
  
  // Modals state
  const [expenseModal, setExpenseModal] = useState(false);
  const [debtModal, setDebtModal] = useState(false);
  const [payDebtModal, setPayDebtModal] = useState<string | null>(null); // holds debt_id

  // Data state
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  
  // Mock recent transactions (since we didn't build the fetch for this yet)
  const recentTransactions = [
    { id: 1, desc: 'Supermercado', amount: 45000, category: 'Comida', type: 'Compartido', date: 'Hoy', icon: ShoppingBag },
  ];

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      const { data: banks } = await supabase.from('bank_accounts').select('*');
      if (banks) setBankAccounts(banks);

      const { data: dbDebts } = await supabase.from('debts').select('*');
      if (dbDebts) setDebts(dbDebts);
    }
    loadData();
  }, [expenseModal, debtModal, payDebtModal]); // Reload data when modals close

  const totalBalance = bankAccounts.reduce((acc, b) => acc + Number(b.balance), 0);
  const totalDebt = debts.reduce((acc, d) => acc + (Number(d.total_amount) - Number(d.paid_amount)), 0);

  async function handleAddExpense(formData: FormData) {
    await addExpenseAction(formData);
    setExpenseModal(false);
  }

  async function handleAddDebt(formData: FormData) {
    await addDebtAction(formData);
    setDebtModal(false);
  }

  async function handlePayDebt(formData: FormData) {
    await payDebtAction(formData);
    setPayDebtModal(null);
  }

  return (
    <main className="min-h-screen pb-24 bg-[#09090b]">
      
      {/* HEADER TIPO BILLETERA */}
      <div className="bg-gradient-to-b from-indigo-900/40 to-transparent pt-12 pb-6 px-6 rounded-b-3xl border-b border-white/5">
        <header className="flex justify-between items-center mb-8">
          <div>
            <p className="text-zinc-400 text-sm font-medium">Balance Total</p>
            <h1 className="text-4xl font-bold tracking-tight text-white mt-1">${totalBalance.toLocaleString()}</h1>
          </div>
          <form action={logout}>
            <button className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <LogOut size={16} />
            </button>
          </form>
        </header>

        {/* MENÚ DE TABS */}
        <div className="flex gap-2 bg-black/40 p-1 rounded-2xl backdrop-blur-md w-full max-w-sm border border-white/5">
          <button onClick={() => setActiveTab('billetera')} className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'billetera' ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300'}`}>Billetera</button>
          <button onClick={() => setActiveTab('deudas')} className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${activeTab === 'deudas' ? 'bg-red-500/20 text-red-300' : 'text-zinc-500 hover:text-zinc-300'}`}>Deudas</button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* VISTA: BILLETERA */}
        {activeTab === 'billetera' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tarjetas Bancarias Horizontal Scroll */}
            <h2 className="text-lg font-semibold mb-4 text-white">Tus Cuentas</h2>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
              {bankAccounts.length === 0 ? (
                <div className="min-w-[280px] h-40 rounded-2xl bg-white/5 border border-white/10 border-dashed flex items-center justify-center text-zinc-500 text-sm p-6 text-center">
                  Crea tu primera cuenta en Supabase para verla aquí.
                </div>
              ) : (
                bankAccounts.map(b => (
                  <div key={b.id} className="snap-center min-w-[280px] max-w-[300px] h-48 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl bg-gradient-to-br from-zinc-800 to-zinc-900">
                    {/* Diseño Glassmorphism de Tarjeta */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start z-10">
                      <Landmark className="text-zinc-400" size={24} />
                      <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-medium text-zinc-400 tracking-wider uppercase border border-white/5">{b.user_id ? 'Personal' : 'Cuenta'}</span>
                    </div>
                    <div className="z-10">
                      <p className="text-zinc-400 text-sm mb-1">{b.name}</p>
                      <p className={`text-2xl font-bold tracking-tight ${b.balance < 0 ? 'text-red-400' : 'text-white'}`}>
                        ${b.balance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button onClick={() => setExpenseModal(true)} className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-indigo-500/10 transition-colors border border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><Plus size={20} /></div>
                <span className="text-sm font-medium text-zinc-300">Nuevo Gasto</span>
              </button>
              <button className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-blue-500/10 transition-colors border border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><ArrowRightLeft size={20} /></div>
                <span className="text-sm font-medium text-zinc-300">Transferir</span>
              </button>
            </div>
          </div>
        )}

        {/* VISTA: DEUDAS */}
        {activeTab === 'deudas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Deudas Activas</h2>
                <p className="text-sm text-red-400 font-medium">Deuda Total: ${totalDebt.toLocaleString()}</p>
              </div>
              <button onClick={() => setDebtModal(true)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {debts.length === 0 ? (
                <div className="text-center p-8 glass-panel rounded-2xl border-dashed">
                  <p className="text-zinc-500 text-sm">No tienes deudas registradas.</p>
                </div>
              ) : (
                debts.map(d => {
                  const progress = Math.min((d.paid_amount / d.total_amount) * 100, 100);
                  const isPaidOff = progress >= 100;
                  
                  return (
                    <div key={d.id} className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                      {isPaidOff && <div className="absolute inset-0 bg-green-500/5 z-0 pointer-events-none"></div>}
                      
                      <div className="relative z-10 flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-white">{d.name}</h3>
                          <p className="text-xs text-zinc-400 mt-1">Faltan ${(d.total_amount - d.paid_amount).toLocaleString()}</p>
                        </div>
                        {!isPaidOff && (
                          <button onClick={() => setPayDebtModal(d.id)} className="text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">
                            Abonar
                          </button>
                        )}
                      </div>

                      {/* Barra de Progreso */}
                      <div className="relative z-10">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-medium">
                          <span>${d.paid_amount.toLocaleString()} pagado</span>
                          <span>${d.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${isPaidOff ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: NUEVO GASTO */}
      {expenseModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#18181b] w-full max-w-md p-6 sm:rounded-3xl rounded-t-3xl border border-white/10 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Registrar Gasto</h2>
              <button onClick={() => setExpenseModal(false)} className="text-zinc-400"><X size={20} /></button>
            </div>
            
            <form action={handleAddExpense} className="space-y-4">
              <input name="amount" type="number" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="Monto ($)" />
              <input name="description" type="text" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" placeholder="Descripción (ej. Supermercado)" />
              
              <div className="grid grid-cols-2 gap-3">
                <select name="category" className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none">
                  <option value="Comida">Comida</option><option value="Hogar">Hogar</option><option value="Transporte">Transporte</option>
                </select>
                <select name="split_type" className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none">
                  <option value="50/50">Compartido (50/50)</option><option value="100%_personal">100% Personal</option>
                </select>
              </div>

              <select name="bank_account_id" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none">
                {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (${b.balance})</option>)}
              </select>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3.5 font-medium mt-4">Guardar Gasto</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA DEUDA */}
      {debtModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#18181b] w-full max-w-md p-6 sm:rounded-3xl rounded-t-3xl border border-white/10 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Agregar Deuda</h2>
              <button onClick={() => setDebtModal(false)} className="text-zinc-400"><X size={20} /></button>
            </div>
            
            <form action={handleAddDebt} className="space-y-4">
              <input name="name" type="text" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Nombre (ej. Crédito Automotriz)" />
              <input name="total_amount" type="number" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none" placeholder="Monto Total a Pagar ($)" />
              
              <p className="text-xs text-zinc-500">Esta deuda quedará vinculada a tu usuario de forma personal, pero será visible para cuadrar los saldos del grupo familiar.</p>

              <button type="submit" className="w-full bg-red-600/90 hover:bg-red-500 text-white rounded-xl py-3.5 font-medium mt-4">Guardar Deuda</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ABONAR DEUDA */}
      {payDebtModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#18181b] w-full max-w-md p-6 sm:rounded-3xl rounded-t-3xl border border-white/10 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Abonar a Deuda</h2>
              <button onClick={() => setPayDebtModal(null)} className="text-zinc-400"><X size={20} /></button>
            </div>
            
            <form action={handlePayDebt} className="space-y-4">
              <input type="hidden" name="debt_id" value={payDebtModal} />
              <input name="amount" type="number" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none" placeholder="Monto a abonar ($)" />
              
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1 ml-1">¿De qué cuenta salió el dinero?</label>
                <select name="bank_account_id" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none appearance-none">
                  {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (Saldo: ${b.balance})</option>)}
                </select>
              </div>

              <p className="text-xs text-zinc-500">Este monto se sumará al progreso de tu deuda y se descontará automáticamente del saldo de tu cuenta bancaria seleccionada.</p>

              <button type="submit" className="w-full bg-green-600/90 hover:bg-green-500 text-white rounded-xl py-3.5 font-medium mt-4">Confirmar Pago</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
