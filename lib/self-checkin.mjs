import { TRYOUT_EVENTS } from "./tryouts.mjs";
export const SELF_CHECKIN_EVENT = TRYOUT_EVENTS.find(event => event.id === "high-school");
export const SELF_CHECKIN_OPEN = new Date(Date.parse(SELF_CHECKIN_EVENT.start) - 45 * 60 * 1000).toISOString();
export const SELF_CHECKIN_CLOSE = '2026-11-22T22:00:00.000Z';
export function selfCheckinWindow(now = Date.now()) {
  return { open: now >= Date.parse(SELF_CHECKIN_OPEN) && now < Date.parse(SELF_CHECKIN_CLOSE),
    opensAt: SELF_CHECKIN_OPEN, closesAt: SELF_CHECKIN_CLOSE, startsAt: SELF_CHECKIN_EVENT.start };
}
