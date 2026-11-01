'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const chartConfig = {
  balance: { label: 'Saldo', color: 'var(--chart-2)' },
} satisfies ChartConfig;

// Las fechas llegan como 'YYYY-MM-DD' (día de Bogotá). Se interpretan a mediodía
// UTC y se formatean en UTC para que la zona horaria del navegador no corra el día.
const shortDay = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' });
const longDay = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' });
const toDate = (value: string) => new Date(`${value}T12:00:00Z`);

/** Evolución del saldo de horas al cierre de cada día con movimientos. */
export function BalanceChart({ data }: { data: { date: string; balance: number }[] }) {
  if (data.length === 0) {
    return (
      <p className='flex h-64 items-center justify-center text-sm text-muted-foreground'>
        Sin movimientos para graficar.
      </p>
    );
  }

  return (
    <ChartContainer config={chartConfig} className='aspect-auto h-64 w-full'>
      <AreaChart data={data} margin={{ left: 0, right: 12, top: 8 }}>
        <defs>
          <linearGradient id='fillBalance' x1='0' y1='0' x2='0' y2='1'>
            <stop offset='5%' stopColor='var(--color-balance)' stopOpacity={0.4} />
            <stop offset='95%' stopColor='var(--color-balance)' stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey='date'
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
          tickFormatter={(value: string) => shortDay.format(toDate(value))}
        />
        <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(value: number) => `${value} h`} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => longDay.format(toDate(String(value)))}
              formatter={(value) => (
                <span>
                  Saldo: <span className='font-mono font-medium tabular-nums'>{value} h</span>
                </span>
              )}
            />
          }
        />
        <Area
          dataKey='balance'
          type='stepAfter'
          stroke='var(--color-balance)'
          strokeWidth={2}
          fill='url(#fillBalance)'
          // Puntos visibles: marcan los días con movimientos y hacen legible el
          // caso de un solo día (un área de un punto no se dibuja).
          dot={{ r: 3, fill: 'var(--color-balance)', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
