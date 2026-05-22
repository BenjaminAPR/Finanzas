'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, CreditCard, ArrowRightLeft,
  ShoppingBag, Home as HomeIcon, Plus,
  PiggyBank, LogOut, Landmark, X, Percent,
  Users, Settings, Car, Coffee, Receipt,
  TrendingDown
} from 'lucide-react';
import { logout } from './login/actions';
import { addExpenseAction, addDebtAction, payDebtAction, createBankAccountAction } from './actions';
import { createClient } from '@/utils/supabase/client';

export default function WalletDashboard() {
  const [activeTab, setActiveTab] = useState<'billetera' | 'deudas' | 'ahorros' | 'ajustes'>('billetera');
  
  // Modals state
  const [expenseModal, setExpenseModal] = useState(false);
  const [debtModal, setDebtModal] = useState(false);
  const [payDebtModal, setPayDebtModal] = useState<string | null>(null); // holds debt_id
  const [bankModal, setBankModal] = useState(false);

  // Data state
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      const { data: banks } = await supabase.from('bank_accounts').select('*');
      if (banks) setBankAccounts(banks);

      const { data: dbDebts } = await supabase.from('debts').select('*');
      if (dbDebts) setDebts(dbDebts);

      const { data: exp } = await supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(20);
      if (exp) setExpenses(exp);

      // Fetch household members to show in settings
      const { data: memberData } = await supabase.from('household_members').select('household_id').eq('user_id', user?.id).single();
      if (memberData) {
        const { data: members } = await supabase.from('household_members').select(`user_id, users(name, email)`).eq('household_id', memberData.household_id);
        if (members) setHouseholdMembers(members);
      }
    }
    loadData();
  }, [expenseModal, debtModal, payDebtModal, bankModal]);

  const totalBalance = bankAccounts.reduce((acc, b) => acc + Number(b.balance), 0);
  const totalDebt = debts.reduce((acc, d) => acc + (Number(d.total_amount) - Number(d.paid_amount)), 0);

  // Helper icons for categories
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Comida': return <ShoppingBag size={18} />;
      case 'Hogar': return <HomeIcon size={18} />;
      case 'Transporte': return <Car size={18} />;
      case 'Ocio': return <Coffee size={18} />;
      default: return <Receipt size={18} />;
    }
  }

  async function handleAddExpense(formData: FormData) {
    try {
      await addExpenseAction(formData);
      setExpenseModal(false);
    } catch (e: any) { alert(e.message) }
  }

  async function handleAddDebt(formData: FormData) {
    try {
      await addDebtAction(formData);
      setDebtModal(false);
    } catch (e: any) { alert(e.message) }
  }

  async function handlePayDebt(formData: FormData) {
    try {
      await payDebtAction(formData);
      setPayDebtModal(null);
    } catch (e: any) { alert(e.message) }
  }

  async function handleCreateBank(formData: FormData) {
    try {
      await createBankAccountAction(formData);
      setBankModal(false);
    } catch (e: any) { alert(e.message) }
  }

  return (
    <main className="min-h-screen pb-24 bg-[#09090b]">
      
      {/* HEADER TIPO BILLETERA */}
      <div className="bg-gradient-to-b from-indigo-900/40 to-transparent pt-12 pb-6 px-6 rounded-b-3xl border-b border-white/5">
        <header className="flex justify-between items-center mb-6">
          <div>
            <p className="text-zinc-400 text-sm font-medium">Patrimonio Líquido</p>
            <h1 className="text-4xl font-bold tracking-tight text-white mt-1">${totalBalance.toLocaleString()}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-indigo-300">
            {currentUser?.email?.charAt(0).toUpperCase()}
          </div>
        </header>
      </div>

      <div className="p-6 space-y-8">
        
        {/* VISTA: BILLETERA */}
        {activeTab === 'billetera' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Tarjetas Bancarias */}
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-lg font-semibold text-white">Cuentas y Tarjetas</h2>
              {bankAccounts.length === 0 && (
                <button onClick={() => setActiveTab('ajustes')} className="text-sm text-indigo-400">Crear una</button>
              )}
            </div>
            
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
              {bankAccounts.length === 0 ? (
                <div onClick={() => setActiveTab('ajustes')} className="cursor-pointer min-w-[280px] h-40 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 border-dashed flex flex-col items-center justify-center text-indigo-300 text-sm p-6 text-center hover:bg-indigo-500/20 transition-colors">
                  <Plus size={24} className="mb-2" />
                  Crear tu primera cuenta
                </div>
              ) : (
                bankAccounts.map(b => (
                  <div key={b.id} className="snap-center min-w-[280px] max-w-[300px] h-48 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between border border-white/10 shadow-2xl bg-gradient-to-br from-zinc-800 to-zinc-900">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start z-10">
                      <Landmark className="text-zinc-400" size={24} />
                      <span className="px-2 py-1 bg-white/5 rounded-md text-[10px] font-medium text-zinc-400 tracking-wider uppercase border border-white/5">{b.user_id === currentUser?.id ? 'Personal' : 'Compartida'}</span>
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
            <div className="grid grid-cols-2 gap-4 my-6">
              <button onClick={() => setExpenseModal(true)} className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-indigo-500/10 transition-colors border border-white/5">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400"><TrendingDown size={20} /></div>
                <span className="text-sm font-medium text-zinc-300">Nuevo Gasto</span>
              </button>
              <button className="glass-panel p-4 rounded-2xl flex flex-col items-center gap-3 hover:bg-blue-500/10 transition-colors border border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><ArrowRightLeft size={20} /></div>
                <span className="text-sm font-medium text-zinc-300">Transferir</span>
              </button>
            </div>

            {/* Historial de Movimientos */}
            <h2 className="text-lg font-semibold text-white mb-4">Últimos Movimientos</h2>
            <div className="space-y-3">
              {expenses.length === 0 ? (
                <p className="text-center text-zinc-500 text-sm py-8 glass-panel rounded-2xl">Aún no hay movimientos registrados.</p>
              ) : (
                expenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between p-4 glass-panel rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                        {getCategoryIcon(e.category)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{e.description}</p>
                        <p className="text-[11px] text-zinc-500">{e.category} • {e.split_type === '50/50' ? 'Compartido' : 'Personal'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">-${e.amount.toLocaleString()}</p>
                      <p className="text-[11px] text-zinc-500">{new Date(e.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
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
                          <button onClick={() => setPayDebtModal(d.id)} className="text-xs font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors">Abonar</button>
                        )}
                      </div>
                      <div className="relative z-10">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1 font-medium">
                          <span>${d.paid_amount.toLocaleString()} pagado</span>
                          <span>${d.total_amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${isPaidOff ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* VISTA: AJUSTES & FAMILIA */}
        {activeTab === 'ajustes' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            
            <section className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <Users className="text-indigo-400" size={20} />
                <h2 className="text-lg font-semibold text-white">Núcleo Familiar</h2>
              </div>
              <div className="space-y-3">
                {householdMembers.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                    <span className="text-sm text-zinc-300">{m.users.email}</span>
                    {m.user_id === currentUser?.id && <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Tú</span>}
                  </div>
                ))}
                <button className="w-full mt-2 py-3 border border-white/10 border-dashed rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">
                  + Invitar Pareja
                </button>
              </div>
            </section>

            <section className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Landmark className="text-emerald-400" size={20} />
                  <h2 className="text-lg font-semibold text-white">Mis Cuentas Bancarias</h2>
                </div>
                <button onClick={() => setBankModal(true)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-3">
                {bankAccounts.length === 0 ? (
                  <p className="text-sm text-zinc-500">No tienes cuentas. Crea una para empezar.</p>
                ) : (
                  bankAccounts.map(b => (
                    <div key={b.id} className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
                      <div>
                        <p className="text-sm font-medium text-white">{b.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Saldo: ${b.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <form action={logout}>
              <button className="w-full py-4 bg-red-500/10 text-red-400 rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </form>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#09090b]/80 backdrop-blur-xl border-t border-white/5 pb-safe z-40">
        <div className="flex justify-around items-center px-6 py-4 max-w-md mx-auto">
          <button onClick={() => setActiveTab('billetera')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'billetera' ? 'text-indigo-400' : 'text-zinc-500'}`}>
            <Wallet size={24} />
            <span className="text-[10px] font-medium">Billetera</span>
          </button>
          <button onClick={() => setActiveTab('deudas')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'deudas' ? 'text-indigo-400' : 'text-zinc-500'}`}>
            <CreditCard size={24} />
            <span className="text-[10px] font-medium">Deudas</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-zinc-700 cursor-not-allowed">
            <PiggyBank size={24} />
            <span className="text-[10px] font-medium">Ahorros</span>
          </button>
          <button onClick={() => setActiveTab('ajustes')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'ajustes' ? 'text-indigo-400' : 'text-zinc-500'}`}>
            <Settings size={24} />
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
        </div>
      </nav>

      {/* MODAL: NUEVA CUENTA BANCARIA */}
      {bankModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-[#18181b] w-full max-w-md p-6 sm:rounded-3xl rounded-t-3xl border border-white/10 animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Agregar Cuenta Bancaria</h2>
              <button onClick={() => setBankModal(false)} className="text-zinc-400"><X size={20} /></button>
            </div>
            
            <form action={handleCreateBank} className="space-y-4">
              <input name="name" type="text" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Nombre (ej. Banco Falabella)" />
              <input name="balance" type="number" required className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Saldo Actual ($)" />
              <p className="text-xs text-zinc-500">Ingresa tu saldo real actual para que la aplicación comience a cuadrar matemáticamente desde este monto.</p>
              <button type="submit" className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl py-3.5 font-medium mt-4">Guardar Cuenta</button>
            </form>
          </div>
        </div>
      )}

      {/* MODALES ANTERIORES (Gasto, Deuda, Pago Deuda) - Omitidos visualmente en este bloque por espacio pero los reinserto abajo */}
      
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
                  <option value="Comida">Comida</option><option value="Hogar">Hogar</option><option value="Transporte">Transporte</option><option value="Ocio">Ocio</option>
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
              <button type="submit" className="w-full bg-red-600/90 hover:bg-red-500 text-white rounded-xl py-3.5 font-medium mt-4">Guardar Deuda</button>
            </form>
          </div>
        </div>
      )}

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
              <select name="bank_account_id" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-green-500 outline-none appearance-none">
                {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.name} (Saldo: ${b.balance})</option>)}
              </select>
              <button type="submit" className="w-full bg-green-600/90 hover:bg-green-500 text-white rounded-xl py-3.5 font-medium mt-4">Confirmar Pago</button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
