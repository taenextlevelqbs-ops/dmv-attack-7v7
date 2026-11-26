export const filmDivisions = ["10U", "12U", "14U", "15U", "18U"] as const;
export const filmPositions = [
  "Quarterback", "Running Back", "Wide Receiver", "Tight End",
  "Defensive Back", "Linebacker", "Athlete / Multiple Positions",
] as const;

export function safeFilmUrl(value: string) {
  if (value.length > 500) return null;
  try {
    const url = new URL(value);
    const host = url.hostname;
    const supportedHost = host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")
      || host === "hudl.com" || host.endsWith(".hudl.com") || host === "vimeo.com" || host === "www.vimeo.com"
      || host === "player.vimeo.com";
    if (url.protocol !== "https:" || !supportedHost || url.username || url.password || url.port || url.pathname === "/") return null;
    url.hash = "";
    return url.toString().length <= 500 ? url.toString() : null;
  } catch {
    return null;
  }
}
