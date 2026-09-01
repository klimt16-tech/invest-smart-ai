CREATE TABLE public.positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  ticker TEXT NOT NULL DEFAULT '—',
  tipo TEXT NOT NULL DEFAULT 'Fondo',
  cantidad NUMERIC NOT NULL DEFAULT 0,
  precio_medio NUMERIC NOT NULL DEFAULT 0,
  precio_actual NUMERIC NOT NULL DEFAULT 0,
  subcartera TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.positions TO authenticated;
GRANT ALL ON public.positions TO service_role;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "positions_own" ON public.positions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  fecha DATE NOT NULL DEFAULT current_date,
  tipo TEXT NOT NULL,
  activo TEXT NOT NULL DEFAULT '',
  cantidad NUMERIC,
  precio NUMERIC,
  importe NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movements TO authenticated;
GRANT ALL ON public.movements TO service_role;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movements_own" ON public.movements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.allocation_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  objetivo NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, categoria)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.allocation_targets TO authenticated;
GRANT ALL ON public.allocation_targets TO service_role;
ALTER TABLE public.allocation_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allocation_targets_own" ON public.allocation_targets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);