import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 1. Recibir datos del bot
    const body = await request.json();
    const { phone_number, amount, description, category, split_type } = body;

    if (!phone_number || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Buscar al usuario por número de teléfono
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', phone_number)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user.id;

    // 3. Buscar el household del usuario (asumimos que pertenece a 1)
    const { data: member, error: memberError } = await supabaseAdmin
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (memberError || !member) {
      return NextResponse.json({ error: 'User has no household' }, { status: 400 });
    }

    const householdId = member.household_id;

    // 4. Insertar el gasto
    const { error: insertError } = await supabaseAdmin
      .from('expenses')
      .insert({
        amount,
        description,
        category: category || 'General',
        split_type: split_type || '50/50',
        paid_by: userId,
        household_id: householdId,
        // date will default to today based on SQL schema
      });

    if (insertError) {
      console.error('Error inserting expense:', insertError);
      return NextResponse.json({ error: 'Failed to insert expense' }, { status: 500 });
    }

    // 5. Opcional: Calcular el balance actual (lo haremos simplificado por ahora)
    return NextResponse.json({ 
      success: true, 
      message: 'Gasto registrado correctamente' 
    });

  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
