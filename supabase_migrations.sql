-- 1. Crear tabla 'incomes'
CREATE TABLE incomes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE SET NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla 'budgets'
CREATE TABLE budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category TEXT NOT NULL,
    allocated_amount NUMERIC NOT NULL,
    spent_amount NUMERIC DEFAULT 0,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Modificar tabla 'expenses' para soportar presupuestos, cuotas y deudas
ALTER TABLE expenses
ADD COLUMN budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
ADD COLUMN is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN installment_current INTEGER DEFAULT NULL,
ADD COLUMN installment_total INTEGER DEFAULT NULL,
ADD COLUMN parent_expense_id UUID REFERENCES expenses(id) ON DELETE CASCADE,
ADD COLUMN debt_id UUID REFERENCES debts(id) ON DELETE SET NULL;
