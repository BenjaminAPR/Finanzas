'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpenseAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const split_type = formData.get('split_type') as string || '100%_personal'
  const bank_account_id = formData.get('bank_account_id') as string

  const budget_id = formData.get('budget_id') as string
  const is_installment = formData.get('is_installment') === 'on' || formData.get('is_installment') === 'true'
  const installment_total = parseInt(formData.get('installment_total') as string) || null

  const household_id = await getOrCreateHousehold(supabase, user.id, user.email || 'Usuario');
  if (!household_id) return { error: "No se pudo generar tu espacio de trabajo." }

  if (is_installment && installment_total && installment_total > 1) {
    const { data: debt, error: debtError } = await supabase.from('debts').insert({
      name: `Compra en Cuotas: ${description}`,
      total_amount: amount * installment_total,
      paid_amount: amount,
      household_id,
      user_id: user.id
    }).select().single()
    if (debtError) return { error: `Error creando deuda: ${debtError.message}` }

    const { error: expError } = await supabase.from('expenses').insert({
      amount,
      description: `${description} (Cuota 1/${installment_total})`,
      category,
      split_type,
      paid_by: user.id,
      household_id,
      bank_account_id: bank_account_id || null,
      budget_id: budget_id || null,
      is_installment: true,
      installment_current: 1,
      installment_total,
      debt_id: debt.id
    })
    if (expError) return { error: `Error guardando la cuota: ${expError.message}` }
  } else {
    const { error } = await supabase
      .from('expenses')
      .insert({
        amount,
        description,
        category,
        split_type,
        paid_by: user.id,
        household_id,
        bank_account_id: bank_account_id || null,
        budget_id: budget_id || null
      })

    if (error) {
      console.error(error)
      return { error: `Error guardando el gasto: ${error.message}` }
    }
  }

  if (bank_account_id) {
    const { data: bank } = await supabase.from('bank_accounts').select('balance').eq('id', bank_account_id).single()
    if (bank) {
      await supabase.from('bank_accounts').update({ balance: Number(bank.balance) - amount }).eq('id', bank_account_id)
    }
  }

  if (budget_id) {
    const { data: budget } = await supabase.from('budgets').select('spent_amount').eq('id', budget_id).single()
    if (budget) {
      await supabase.from('budgets').update({ spent_amount: Number(budget.spent_amount) + amount }).eq('id', budget_id)
    }
  }

  revalidatePath('/', 'page')
  return { success: true }
}

export async function addIncomeAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const bank_account_id = formData.get('bank_account_id') as string

  const household_id = await getOrCreateHousehold(supabase, user.id, user.email || 'Usuario');
  if (!household_id) return { error: "No se pudo generar tu espacio de trabajo." }

  const { error } = await supabase.from('incomes').insert({
    amount,
    description,
    bank_account_id: bank_account_id || null,
    household_id,
    user_id: user.id
  })

  if (error) return { error: `Error guardando ingreso: ${error.message}` }

  if (bank_account_id) {
    const { data: bank } = await supabase.from('bank_accounts').select('balance').eq('id', bank_account_id).single()
    if (bank) {
      await supabase.from('bank_accounts').update({ balance: Number(bank.balance) + amount }).eq('id', bank_account_id)
    }
  }

  revalidatePath('/', 'page')
  return { success: true }
}

export async function createBudgetAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const category = formData.get('category') as string
  const allocated_amount = parseFloat(formData.get('allocated_amount') as string)
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()

  const household_id = await getOrCreateHousehold(supabase, user.id, user.email || 'Usuario');
  if (!household_id) return { error: "No se pudo generar tu espacio de trabajo." }

  // Check if budget already exists for this category/month/year to avoid duplicates
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('category', category)
    .eq('month', month)
    .eq('year', year)
    .eq('household_id', household_id)
    .single();

  if (existing) {
      return { error: `Ya existe un presupuesto para ${category} este mes.` }
  }

  const { error } = await supabase.from('budgets').insert({
    category,
    allocated_amount,
    month,
    year,
    household_id
  })

  if (error) return { error: `Error creando presupuesto: ${error.message}` }
  revalidatePath('/', 'page')
  return { success: true }
}

export async function addDebtAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const name = formData.get('name') as string
  const total_amount = parseFloat(formData.get('total_amount') as string)

  const household_id = await getOrCreateHousehold(supabase, user.id, user.email || 'Usuario');
  if (!household_id) return { error: "No se pudo generar tu espacio de trabajo." }

  const { error } = await supabase.from('debts').insert({
    name,
    total_amount,
    household_id,
    user_id: user.id
  })

  if (error) return { error: `Error guardando la deuda: ${error.message}` }
  revalidatePath('/', 'page')
  return { success: true }
}

export async function payDebtAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const debt_id = formData.get('debt_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const bank_account_id = formData.get('bank_account_id') as string

  const { error } = await supabase.from('debt_payments').insert({
    debt_id,
    amount,
    bank_account_id: bank_account_id || null,
    user_id: user.id
  })

  if (error) return { error: `Error procesando pago: ${error.message}` }

  const { data: debt } = await supabase.from('debts').select('paid_amount').eq('id', debt_id).single()
  if (debt) {
    await supabase.from('debts').update({ paid_amount: debt.paid_amount + amount }).eq('id', debt_id)
  }

  if (bank_account_id) {
    const { data: bank } = await supabase.from('bank_accounts').select('balance').eq('id', bank_account_id).single()
    if (bank) {
      await supabase.from('bank_accounts').update({ balance: bank.balance - amount }).eq('id', bank_account_id)
    }
  }

  revalidatePath('/', 'page')
  return { success: true }
}

export async function createBankAccountAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autorizado" }

  const name = formData.get('name') as string
  const balance = parseFloat(formData.get('balance') as string)

  const household_id = await getOrCreateHousehold(supabase, user.id, user.email || 'Usuario');
  if (!household_id) return { error: "No se pudo generar tu espacio de trabajo." }

  const { error } = await supabase.from('bank_accounts').insert({
    name,
    balance,
    household_id,
    user_id: user.id
  })

  if (error) {
    console.error(error);
    return { error: `Supabase Error: ${error.message} (Code: ${error.code})` }
  }
  revalidatePath('/', 'page')
  return { success: true }
}

async function getOrCreateHousehold(supabase: any, userId: string, userEmail: string) {
  // Check if member exists
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', userId)
    .single();

  if (member?.household_id) return member.household_id;

  // Auto-create household for simplicity
  const { data: newHousehold } = await supabase
    .from('households')
    .insert({ name: `Familia de ${userEmail.split('@')[0]}` })
    .select('id')
    .single();

  if (newHousehold?.id) {
    await supabase.from('household_members').insert({
      user_id: userId,
      household_id: newHousehold.id
    });
    return newHousehold.id;
  }
  return null;
}
