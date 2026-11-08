import 'server-only';
import {createClient} from '@/lib/supabase/server';
import {stripeDatabase} from '@/lib/finance/stripe';
export const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const origin=()=>{const url=new URL(process.env.PAYMENTS_BASE_URL||'https://www.dmvattack.com');if(!['https://www.dmvattack.com','https://dmvattack.com'].includes(url.origin)&&process.env.VERCEL_ENV==='production')throw Error('Invalid origin');return url.origin;};
export async function staff(){const client=await createClient();const {data:{user}}=await client.auth.getUser();if(!user)return null;const {data:p}=await client.from('profiles').select('role').eq('id',user.id).single();if(!p||!['OWNER','ADMIN'].includes(p.role))return null;return{user,db:stripeDatabase()};}
export async function parent(){const client=await createClient();const {data:{user}}=await client.auth.getUser();if(!user?.email_confirmed_at)return null;return{user,db:stripeDatabase()};}
export const missingTable=(error:{code?:string}|null)=>!!error&&['42P01','PGRST202','PGRST205','42883'].includes(error.code||'');
