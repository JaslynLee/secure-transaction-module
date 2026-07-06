export const formatAmount = (val: number, type: 'debit' | 'credit', isMasked: boolean) => {
  if (isMasked) return '····';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
  return type === 'debit' ? `-${formatted}` : `+${formatted}`;
};

export const formatBalance = (val: number, isMasked: boolean) => {
  if (isMasked) return '$ ··,···.··';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(val);
};

export const formatDateShort = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' • ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateLong = (isoStr: string) => {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }) + ' at ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getErrorMessage = (err: any, defaultFallback: string = 'An error occurred. Please try again.'): string => {
  if (!err) return defaultFallback;

  if (typeof err === 'object') {
    const msg =
      ('message' in err && typeof err.message === 'string' ? err.message : '') ||
      ('data' in err && err.data && typeof err.data === 'object' && 'message' in err.data ? String((err.data as any).message) : '') ||
      ('error' in err && typeof err.error === 'string' ? err.error : '');

    if (err.status === 'FETCH_ERROR') {
      return 'Network request failed. Please check your internet connection.';
    }

    if (msg) return msg;
  }

  return defaultFallback;
};
