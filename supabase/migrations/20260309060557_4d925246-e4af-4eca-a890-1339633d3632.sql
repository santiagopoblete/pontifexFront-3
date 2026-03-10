
-- Table to store credit partner institutions and their criteria
CREATE TABLE public.credit_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tipo TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'ORO',
  cobertura_local BOOLEAN NOT NULL DEFAULT false,
  cobertura_estatal BOOLEAN NOT NULL DEFAULT false,
  cobertura_regional BOOLEAN NOT NULL DEFAULT false,
  cobertura_nacional BOOLEAN NOT NULL DEFAULT false,
  credito_simple BOOLEAN NOT NULL DEFAULT false,
  credito_revolvente BOOLEAN NOT NULL DEFAULT false,
  factoraje BOOLEAN NOT NULL DEFAULT false,
  arrendamiento BOOLEAN NOT NULL DEFAULT false,
  exp_menor_1_anio BOOLEAN NOT NULL DEFAULT false,
  exp_1_anio BOOLEAN NOT NULL DEFAULT false,
  exp_2_o_mas BOOLEAN NOT NULL DEFAULT false,
  sector_comercio BOOLEAN NOT NULL DEFAULT false,
  sector_industria BOOLEAN NOT NULL DEFAULT false,
  sector_servicios BOOLEAN NOT NULL DEFAULT false,
  sector_primario BOOLEAN NOT NULL DEFAULT false,
  buro_excelente BOOLEAN NOT NULL DEFAULT false,
  buro_bueno BOOLEAN NOT NULL DEFAULT false,
  buro_regular BOOLEAN NOT NULL DEFAULT false,
  mal_buro BOOLEAN NOT NULL DEFAULT false,
  garantia_aval BOOLEAN NOT NULL DEFAULT false,
  garantia_patrimonial BOOLEAN NOT NULL DEFAULT false,
  garantia_hipotecaria BOOLEAN NOT NULL DEFAULT false,
  garantia_prendaria BOOLEAN NOT NULL DEFAULT false,
  garantia_liquida BOOLEAN NOT NULL DEFAULT false,
  garantia_contratos BOOLEAN NOT NULL DEFAULT false,
  acepta_utilidad BOOLEAN NOT NULL DEFAULT false,
  acepta_perdida BOOLEAN NOT NULL DEFAULT false,
  acepta_quiebra_tecnica BOOLEAN NOT NULL DEFAULT false,
  mas_rentable BOOLEAN NOT NULL DEFAULT false,
  tiene_contrato BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read credit partners"
  ON public.credit_partners FOR SELECT
  USING (true);
