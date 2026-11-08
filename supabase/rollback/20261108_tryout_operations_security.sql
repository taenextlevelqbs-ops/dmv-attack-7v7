-- Security-only rollback, run as the same SQL owner that applied the upgrade.
-- Preserves registrations, photos, profiles, fees, receipts and all audit tables.
-- Prefer rolling application code back first; restore access only after review.
begin;
drop policy if exists tryout_ops_own_profile_allow on public.profiles;
drop policy if exists tryout_ops_own_profile_restrict on public.profiles;
do $$declare snapshot record;permission jsonb;role_sql text;begin
 for snapshot in select * from public.tryout_ops_security_baseline loop
  if snapshot.table_name<>'profiles' then execute format('drop policy if exists tryout_ops_browser_deny on public.%I',snapshot.table_name);end if;
  execute format('revoke all on public.%I from public,anon,authenticated,service_role',snapshot.table_name);
  for permission in select value from jsonb_array_elements(snapshot.grants) loop
   role_sql:=case when permission->>'role'='PUBLIC' then 'PUBLIC' else quote_ident(permission->>'role') end;
   if permission->>'privilege' not in ('SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN') then raise exception 'Unexpected saved privilege';end if;
   execute format('grant %s on public.%I to %s%s',permission->>'privilege',snapshot.table_name,role_sql,case when permission->>'grantable'='YES' then ' with grant option' else '' end);
  end loop;
  if not snapshot.rls_enabled then execute format('alter table public.%I disable row level security',snapshot.table_name);end if;
 end loop;
end;$$;
commit;
