export async function allRows<T>(
  read: (
    start: number,
    end: number,
  ) => PromiseLike<{ data: T[] | null; error: { code?: string } | null }>,
) {
  const rows: T[] = [];
  for (let start = 0; start < 100000; start += 1000) {
    const page = await read(start, start + 999);
    if (page.error) return { data: null, error: page.error };
    rows.push(...(page.data || []));
    if (!page.data || page.data.length < 1000)
      return { data: rows, error: null };
  }
  return { data: null, error: { code: "TOO_MANY_RECORDS" } };
}
