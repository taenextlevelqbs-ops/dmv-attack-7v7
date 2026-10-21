export const dynamic='force-dynamic';
export async function GET(){return Response.json({service:'DMV Attack',release:'private-stripe-checkout-v1',commit:process.env.VERCEL_GIT_COMMIT_SHA||null},{headers:{'Cache-Control':'no-store'}});}
