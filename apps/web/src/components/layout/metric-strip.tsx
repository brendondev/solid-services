'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

interface Metric {
  label: ReactNode;
  value: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'destructive';
  /**
   * Variação percentual em relação ao período anterior. Só passe quando houver
   * dado real para comparar — tile sem histórico deve ficar sem selo, e não
   * com "0%", que o usuário lê como "não mudou".
   */
  delta?: number;
  /** Texto do que a variação compara. Padrão: "vs. mês anterior". */
  deltaLabel?: string;
  /** Para métricas em que cair é bom (inadimplência, cancelamentos). */
  goodDirection?: 'up' | 'down';
  /** Série histórica para o sparkline. Precisa de 2+ pontos. */
  spark?: number[];
}

const tones = {
  neutral: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

/** Sparkline em SVG puro — evita montar um Recharts por tile. */
function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 72;
  const h = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = points.length > 1 ? w / (points.length - 1) : w;

  const coords = points.map((p, i) => {
    const x = i * step;
    // SVG cresce para baixo: inverter para o maior valor ficar no topo.
    const y = h - ((p - min) / span) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const stroke = positive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden="true">
      <motion.polyline
        points={coords.join(' ')}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </svg>
  );
}

function DeltaBadge({ delta, goodDirection = 'up', label }: { delta: number; goodDirection?: 'up' | 'down'; label?: string }) {
  const flat = Math.abs(delta) < 0.05;
  const up = delta > 0;
  const good = flat ? null : (goodDirection === 'up' ? up : !up);
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  const cls = flat
    ? 'bg-muted text-muted-foreground'
    : good
      ? 'bg-success/10 text-success'
      : 'bg-destructive/10 text-destructive';

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium leading-none ${cls}`}
      title={label || 'vs. mês anterior'}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {flat ? '0%' : `${up ? '+' : ''}${delta.toFixed(0)}%`}
      <span className="sr-only"> {label || 'em relação ao mês anterior'}</span>
    </span>
  );
}

// Colunas acompanham a quantidade de métricas: com 4 fixas, uma faixa de 5
// itens quebrava em 4 + 1 órfão.
const columnsByCount: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
  6: 'sm:grid-cols-6',
};

export function MetricStrip({ items }: { items: Metric[] }) {
  const columns = columnsByCount[items.length] || 'sm:grid-cols-4';
  return (
    <dl className={`grid grid-cols-2 gap-x-6 gap-y-4 border-y py-4 ${columns}`}>
      {items.map((item, index) => {
        // Série achatada (tudo zero, ou um único valor repetido) vira um risco
        // solto na tela e não informa nada — melhor não desenhar.
        const spark = item.spark;
        const hasSpark = !!spark
          && spark.length > 1
          && spark.some(n => n !== 0)
          && new Set(spark).size > 1;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut', delay: index * 0.06 }}
            className="group min-w-0 rounded-md px-2 py-1 -mx-2 transition-colors hover:bg-muted/50"
          >
            <dt className="text-xs leading-5 text-muted-foreground">{item.label}</dt>
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <dd className={`mt-1 break-words text-xl font-semibold leading-7 tracking-tight tabular-nums ${tones[item.tone || 'neutral']}`}>
                  {item.value}
                </dd>
                {item.delta !== undefined && (
                  <div className="mt-1">
                    <DeltaBadge delta={item.delta} goodDirection={item.goodDirection} label={item.deltaLabel} />
                  </div>
                )}
              </div>
              {hasSpark && (
                <div className="hidden shrink-0 opacity-70 transition-opacity group-hover:opacity-100 sm:block">
                  <Sparkline points={item.spark!} positive={(item.delta ?? 0) >= 0} />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </dl>
  );
}
