'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addExpenseAction(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const split_type = formData.get('split_type') as string
  const bank_account_id = formData.get('bank_account_id') as string

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single()

  if (!member) throw new Error("No perteneces a un household")

  // Insert Expense
  const { error } = await supabase
    .from('expenses')
    .insert({
      amount,
      description,
      category,
      split_type,
      paid_by: user.id,
      household_id: member.household_id,
      bank_account_id: bank_account_id || null
    })

  if (error) {
    console.error(error)
    throw new Error("Error guardando el gasto")
  }

  // Update bank balance
  if (bank_account_id) {
    const { data: bank } = await supabase.from('bank_accounts').select('balance').eq('id', bank_account_id).single()
    if (bank) {
      await supabase.from('bank_accounts').update({ balance: bank.balance - amount }).eq('id', bank_account_id)
    }
  }

  revalidatePath('/', 'page')
  return { success: true }
}

export async function addDebtAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const name = formData.get('name') as string
  const total_amount = parseFloat(formData.get('total_amount') as string)

  const { data: member } = await supabase.from('household_members').select('household_id').eq('user_id', user.id).single()
  if (!member) throw new Error("No perteneces a un household")

  const { error } = await supabase.from('debts').insert({
    name,
    total_amount,
    household_id: member.household_id,
    user_id: user.id
  })

  if (error) throw new Error("Error guardando la deuda")
  revalidatePath('/', 'page')
  return { success: true }
}

export async function payDebtAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("No autorizado")

  const debt_id = formData.get('debt_id') as string
  const amount = parseFloat(formData.get('amount') as string)
  const bank_account_id = formData.get('bank_account_id') as string

  // 1. Insert Payment
  const { error } = await supabase.from('debt_payments').insert({
    debt_id,
    amount,
    bank_account_id: bank_account_id || null,
    user_id: user.id
  })

  if (error) throw new Error("Error procesando pago")

  // 2. Update Debt paid_amount
  const { data: debt } = await supabase.from('debts').select('paid_amount').eq('id', debt_id).single()
  if (debt) {
    await supabase.from('debts').update({ paid_amount: debt.paid_amount + amount }).eq('id', debt_id)
  }

  // 3. Update Bank Balance
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
  if (!user) throw new Error("No autorizado")

  const name = formData.get('name') as string
  const balance = parseFloat(formData.get('balance') as string)

  const { data: member } = await supabase.from('household_members').select('household_id').eq('user_id', user.id).single()
  if (!member) throw new Error("No perteneces a un household")

  const { error } = await supabase.from('bank_accounts').insert({
    name,
    balance,
    household_id: member.household_id,
    user_id: user.id
  })

  if (error) {
    console.error(error);
    throw new Error(`Supabase Error: ${error.message} (Code: ${error.code})`)
  }
  revalidatePath('/', 'page')
  return { success: true }
}
