import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.warn('TELEGRAM_BOT_TOKEN missing in environment variables.');
}

const bot = new Telegraf(BOT_TOKEN || 'dummy_token');

// Whitelist de Usuarios Permitidos
const allowedIdsStr = process.env.ALLOWED_TELEGRAM_IDS || '';
const allowedIds = allowedIdsStr.split(',').map(id => id.trim());

bot.use((ctx, next) => {
  if (ctx.from) {
    const telegramId = ctx.from.id.toString();
    if (allowedIds.length > 0 && allowedIds[0] !== '' && !allowedIds.includes(telegramId)) {
      console.log(`Mensaje bloqueado del usuario no autorizado: ${telegramId}`);
      return; 
    }
  }
  return next();
});

bot.start((ctx) => {
  ctx.reply(`¡Hola! Soy el bot de Finanzas en Pareja.\n\nEnvíame tus gastos o ahorros en este formato:\n\n*[Monto] [Descripción] [Categoría] [Personal/Compartido]*\nEjemplo: 15000 Supermercado Comida Compartido\n\nTu Telegram ID es: ${ctx.from.id}. Asegúrate de que esté configurado en la base de datos (campo phone_number).`);
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  
  // Expresión regular para parsear el gasto
  const regex = /^(\d+(?:\.\d+)?)\s+(.*?)\s+(\S+)\s+(Personal|Compartido)$/i;
  const match = text.match(regex);

  if (!match) {
    return ctx.reply('❌ Formato incorrecto. Usa:\n\n[Monto] [Descripción] [Categoría] [Personal/Compartido]\n\nEjemplo: 15000 Supermercado Comida Compartido');
  }

  const amount = parseFloat(match[1]);
  const description = match[2];
  const category = match[3];
  const typeStr = match[4].toLowerCase();
  
  const split_type = typeStr === 'personal' ? '100%_personal' : '50/50';
  const phone_number = ctx.from.id.toString();

  try {
    // Inicializar Supabase Service Role (Para saltar RLS desde el servidor sin sesión de usuario activa)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    // Aquí usamos el Service Role porque el webhook no viene con una cookie de autenticación de usuario
    // Necesitamos privilegios para buscar y escribir.
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar al usuario
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone_number', phone_number)
      .single();

    if (userError || !user) {
      return ctx.reply(`❌ Usuario no encontrado.\nAsegúrate de que tu ID de Telegram (${phone_number}) esté guardado en el campo "phone_number" de tu base de datos.`);
    }

    const userId = user.id;

    // 2. Buscar el household
    const { data: member, error: memberError } = await supabaseAdmin
      .from('household_members')
      .select('household_id')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (memberError || !member) {
      return ctx.reply('❌ No estás vinculado a ningún Grupo Familiar (Household).');
    }

    const householdId = member.household_id;

    // 3. Insertar Gasto
    const { error: insertError } = await supabaseAdmin
      .from('expenses')
      .insert({
        amount,
        description,
        category: category || 'General',
        split_type,
        paid_by: userId,
        household_id: householdId,
      });

    if (insertError) {
      console.error('Insert error', insertError);
      return ctx.reply('⚠️ Hubo un problema al guardar el registro en la base de datos.');
    }

    ctx.reply(`✅ *Registro exitoso*\n💰 Monto: $${amount}\n📝 Desc: ${description}\n📊 Categoría: ${category}\n🔄 Tipo: ${split_type}`);

  } catch (error: any) {
    console.error('Error procesando el webhook:', error);
    ctx.reply('❌ Error interno procesando la solicitud.');
  }
});

// El handler HTTP POST para el Webhook de Telegram
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

// Opcional: handler GET para chequear salud de la API
export async function GET() {
  return NextResponse.json({ ok: true, status: 'Bot Webhook is ready' });
}
