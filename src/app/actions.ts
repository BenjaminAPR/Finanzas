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

  revalidatePath('/', 'page')
  return { success: true }
}
