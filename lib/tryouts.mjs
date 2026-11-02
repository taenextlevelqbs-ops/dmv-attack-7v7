// Confirmed DMV Attack tryouts. Keep dates, metadata and integrations in sync.
export const TRYOUT_LOCATION = {
  name: "Independence High School",
  street: "23115 Learning Circle",
  city: "Ashburn",
  state: "VA",
  postalCode: "20148",
  directions:
    "https://www.google.com/maps/search/?api=1&query=Independence+High+School+23115+Learning+Circle+Ashburn+VA+20148",
};
export const TRYOUT_FEE = 20;
export const STRIPE_TRYOUT_URL =
  "https://buy.stripe.com/5kQfZa9Op1yj2Cq0yt3F600";
export const VENMO_TRYOUT_URL =
  "https://venmo.com/code?user_id=4448738877638638119&created=1792019750.353775&printed=1";
export const TRYOUT_TIME = "3:00–4:30 PM";
export const TRYOUT_EVENTS = [
  {
    id: "youth",
    name: "Youth Tryouts",
    date: "2026-11-08",
    dateLabel: "Sunday, November 8, 2026",
    day: "08",
    month: "NOV",
    divisions: ["10U", "12U", "14U"],
    start: "2026-11-08T15:00:00-05:00",
    end: "2026-11-08T16:30:00-05:00",
  },
  {
    id: "high-school",
    name: "High School Tryouts",
    date: "2026-11-22",
    dateLabel: "Sunday, November 22, 2026",
    day: "22",
    month: "NOV",
    divisions: ["15U", "18U"],
    start: "2026-11-22T15:00:00-05:00",
    end: "2026-11-22T16:30:00-05:00",
  },
];
export function tryoutForDivision(division) {
  return (
    TRYOUT_EVENTS.find((event) => event.divisions.includes(division)) || null
  );
}
export function validConfirmation(value) {
  return Boolean(
    value &&
      typeof value.id === "string" &&
      value.id.length > 0 &&
      value.id.length <= 100 &&
      typeof value.athlete === "string" &&
      value.athlete.length <= 200 &&
      tryoutForDivision(value.division),
  );
}
export const CONFIRMATION_STORAGE_KEY = "dmv.tryout.confirmation";
export const TRYOUT_DESCRIPTION =
  "DMV Attack 7v7 tryouts: November 8, 2026 (10U, 12U, 14U) and November 22, 2026 (15U, 18U), both 3:00–4:30 PM EST at Independence High School, 23115 Learning Circle, Ashburn, VA 20148. $20 per athlete; Stripe and Venmo accepted.";
export const TRYOUT_JSON_LD = TRYOUT_EVENTS.map((event) => ({
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: `DMV Attack ${event.name}`,
  startDate: event.start,
  endDate: event.end,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  sport: "American Football",
  url: "https://www.dmvattack.com/tryouts",
  description: `${event.divisions.join(", ")}. ${TRYOUT_TIME} EST. $20 per athlete. Register before paying with Stripe or Venmo.`,
  location: {
    "@type": "Place",
    name: TRYOUT_LOCATION.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: TRYOUT_LOCATION.street,
      addressLocality: TRYOUT_LOCATION.city,
      addressRegion: TRYOUT_LOCATION.state,
      postalCode: TRYOUT_LOCATION.postalCode,
      addressCountry: "US",
    },
  },
  organizer: {
    "@type": "SportsOrganization",
    name: "DMV Attack",
    url: "https://www.dmvattack.com",
  },
  offers: {
    "@type": "Offer",
    price: TRYOUT_FEE,
    priceCurrency: "USD",
    url: "https://www.dmvattack.com/tryouts",
  },
}));
