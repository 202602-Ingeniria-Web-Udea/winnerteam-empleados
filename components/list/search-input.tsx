'use client';

import { IconSearch, IconX } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import { buildHref } from '@/lib/list-params';

/**
 * Buscador que filtra en el servidor: escribe ?q= en la URL tras una pausa
 * corta (300 ms) y vuelve a la página 1. La URL es la fuente de verdad.
 */
export function SearchInput({
  params,
  placeholder,
  label,
}: {
  params: Record<string, string | undefined>;
  placeholder: string;
  label: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(params.q ?? '');
  const [pending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function navigate(q: string) {
    startTransition(() => router.replace(buildHref(pathname, params, { q, pagina: null })));
  }

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(next.trim()), 300);
  }

  return (
    <InputGroup className='h-10 w-full bg-card sm:w-72'>
      <InputGroupAddon>{pending ? <Spinner /> : <IconSearch />}</InputGroupAddon>
      <InputGroupInput
        type='search'
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        maxLength={80}
      />
      {value && (
        <InputGroupAddon align='inline-end'>
          <InputGroupButton size='icon-xs' aria-label='Limpiar búsqueda' onClick={() => { setValue(''); navigate(''); }}>
            <IconX />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
