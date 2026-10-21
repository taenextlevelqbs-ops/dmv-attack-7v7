/** Network responses resolve before view state is updated. */
export function requestJson(url, options) {
  return fetch(url, options).then(async (response) => {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  });
}
