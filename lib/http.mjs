/** Network responses resolve before view state is updated. */
export function requestJson(url, options) {
  return fetch(url, options).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  });
}

// Auth callbacks may return only to this site's routes, never to an external origin.
export function safeReturnPath(value, fallback = '/admin/tryouts') {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const url = new URL(value, 'https://internal.invalid');
    return url.origin === 'https://internal.invalid' ? url.pathname + url.search + url.hash : fallback;
  } catch { return fallback; }
}
