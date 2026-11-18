import { TRYOUT_EVENTS } from "./tryouts.mjs";
export const SELF_CHECKIN_EVENT = TRYOUT_EVENTS.find(event => event.id === "high-school");
export const SELF_CHECKIN_OPEN = new Date(Date.parse(SELF_CHECKIN_EVENT.start) - 30 * 60 * 1000).toISOString();
export function selfCheckinWindow(now = Date.now()) {
  return { open: now >= Date.parse(SELF_CHECKIN_OPEN) && now < Date.parse(SELF_CHECKIN_EVENT.end),
    opensAt: SELF_CHECKIN_OPEN, closesAt: SELF_CHECKIN_EVENT.end, startsAt: SELF_CHECKIN_EVENT.start };
}
