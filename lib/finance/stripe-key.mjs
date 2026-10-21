// Restricted and standard keys identify the same live/test environments.
export function isLiveStripeKey(key) {
  return typeof key === "string" && /^(?:sk|rk)_live_\S+$/.test(key);
}
