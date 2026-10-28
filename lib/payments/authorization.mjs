export function canAccessRegistration(user, registration, memberships) {
  if (!user?.id || !user.email_confirmed_at || !registration) return false;
  const email = String(user.email || "")
    .trim()
    .toLowerCase();
  if (
    email &&
    email ===
      String(registration.parent_email || "")
        .trim()
        .toLowerCase()
  )
    return true;
  return Boolean(
    registration.linked_family_id &&
      memberships.some(
        (m) =>
          m.profile_id === user.id &&
          m.family_id === registration.linked_family_id,
      ),
  );
}
