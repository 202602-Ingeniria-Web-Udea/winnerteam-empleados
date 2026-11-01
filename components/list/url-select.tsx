'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildHref } from '@/lib/list-params';
import { cn } from '@/lib/utils';

/** Select que guarda su valor en un parámetro de la URL (p. ej. ?orden=). */
export function UrlSelect({
  name,
  value,
  items,
  params,
  label,
  resetPage = true,
}: {
  name: string;
  value: string;
  items: { value: string; label: string }[];
  params: Record<string, string | undefined>;
  label: string;
  resetPage?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (!next) return;
        startTransition(() =>
          router.replace(buildHref(pathname, params, { [name]: next, ...(resetPage ? { pagina: null } : {}) }), {
            scroll: false,
          })
        );
      }}
    >
      <SelectTrigger aria-label={label} className={cn('h-10 w-full bg-card sm:w-52', pending && 'opacity-60')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
