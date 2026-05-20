import { NextResponse } from 'next/server';
import { Telegraf, Markup } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(BOT_TOKEN || 'dummy_token');

// Utility to get Supabase Admin client
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

// 1. Recibir texto (Monto y Descripción)
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const phone_number = ctx.from.id.toString();
  const supabase = getSupabase();

  // Buscar usuario
  const { data: user } = await supabase.from('users').select('id').eq('phone_number', phone_number).single();
  if (!user) return ctx.reply('❌ No estás registrado en el sistema.');

  // Extraer Monto y Descripción
  const match = text.match(/^(\d+(?:\.\d+)?)\s+(.+)$/i);
  if (!match) {
    return ctx.reply('❌ Para registrar un gasto envía el monto y descripción.\nEjemplo: 15000 Supermercado');
  }

  const amount = parseFloat(match[1]);
  const description = match[2];

  // Guardar como Gasto Pendiente
  const { data: pending, error } = await supabase
    .from('pending_bot_expenses')
    .insert({ user_id: user.id, amount, description, step: 'category' })
    .select('id')
    .single();

  if (error || !pending) return ctx.reply('⚠️ Error iniciando el registro.');

  // Mostrar Botones de Categoría
  const buttons = [
    Markup.button.callback('🍔 Comida', `cat_${pending.id}_Comida`),
    Markup.button.callback('🏠 Hogar', `cat_${pending.id}_Hogar`),
    Markup.button.callback('🚗 Transporte', `cat_${pending.id}_Transporte`),
    Markup.button.callback('🎉 Ocio', `cat_${pending.id}_Ocio`),
  ];

  ctx.reply('Selecciona la Categoría:', Markup.inlineKeyboard(buttons, { columns: 2 }));
});

// 2. Manejar Botones (Callbacks)
bot.on('callback_query', async (ctx) => {
  // @ts-ignore
  const data = ctx.callbackQuery.data;
  if (!data) return;

  const phone_number = ctx.from?.id.toString();
  const supabase = getSupabase();
  const { data: user } = await supabase.from('users').select('id').eq('phone_number', phone_number).single();
  if (!user) return;

  const parts = data.split('_');
  const action = parts[0];
  const pendingId = parts[1];
  const value = parts.slice(2).join('_');

  // Recuperar el gasto pendiente
  const { data: pending } = await supabase.from('pending_bot_expenses').select('*').eq('id', pendingId).single();
  if (!pending) return ctx.answerCbQuery('⚠️ Este registro ya expiró o fue completado.');

  if (action === 'cat') {
    // Guardar categoría y preguntar Tipo
    await supabase.from('pending_bot_expenses').update({ category: value, step: 'split' }).eq('id', pendingId);
    
    const buttons = [
      Markup.button.callback('👫 Compartido (50/50)', `split_${pendingId}_50/50`),
      Markup.button.callback('👤 100% Personal', `split_${pendingId}_100%_personal`),
    ];
    
    ctx.editMessageText(`Categoría: ${value}\n\n¿Qué tipo de gasto es?`, Markup.inlineKeyboard(buttons, { columns: 1 }));
    ctx.answerCbQuery();
  } 
  
  else if (action === 'split') {
    // Guardar Tipo y preguntar Banco
    await supabase.from('pending_bot_expenses').update({ split_type: value, step: 'bank' }).eq('id', pendingId);

    // Buscar el Household del usuario para listar sus bancos
    const { data: member } = await supabase.from('household_members').select('household_id').eq('user_id', user.id).single();
    if (!member) return ctx.answerCbQuery('Error: Sin grupo familiar.');

    const { data: banks } = await supabase.from('bank_accounts').select('id, name').eq('household_id', member.household_id);
    
    if (!banks || banks.length === 0) {
      ctx.editMessageText('⚠️ No hay Cuentas Bancarias configuradas en la App. Crea una primero.');
      return ctx.answerCbQuery();
    }

    const buttons = banks.map(b => Markup.button.callback(`🏦 ${b.name}`, `bank_${pendingId}_${b.id}`));
    ctx.editMessageText(`Tipo: ${value === '50/50' ? 'Compartido' : 'Personal'}\n\n¿De qué cuenta se pagó?`, Markup.inlineKeyboard(buttons, { columns: 1 }));
    ctx.answerCbQuery();
  }

  else if (action === 'bank') {
    // Finalizar el gasto
    const bankId = value;

    // Obtener el household
    const { data: member } = await supabase.from('household_members').select('household_id').eq('user_id', user.id).single();
    
    if (member) {
      // Insertar en Gastos reales
      const { error: insertError } = await supabase.from('expenses').insert({
        amount: pending.amount,
        description: pending.description,
        category: pending.category,
        split_type: pending.split_type,
        paid_by: user.id,
        household_id: member.household_id,
        bank_account_id: bankId
      });

      if (!insertError) {
        // Actualizar balance de la cuenta
        await supabase.rpc('decrement_bank_balance', { bank_id: bankId, deduct_amount: pending.amount });
        // (Nota: asume que crearás la función RPC, pero sin ella igual se guarda el gasto)

        // Borrar el pendiente
        await supabase.from('pending_bot_expenses').delete().eq('id', pendingId);

        ctx.editMessageText(`✅ *Gasto Registrado con Éxito*\n💰 Monto: $${pending.amount}\n📝 Desc: ${pending.description}\n📊 Categoría: ${pending.category}\n🔄 Tipo: ${pending.split_type === '50/50' ? 'Compartido' : 'Personal'}\n🏦 Banco ID: ${bankId}`);
      } else {
        ctx.editMessageText('❌ Hubo un error al guardar el gasto final.');
      }
    }
    ctx.answerCbQuery();
  }
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
