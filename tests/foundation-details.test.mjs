import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {webcrypto} from 'node:crypto';

test('business contributions keep company/contact/logo details and request invoice records without a live charge',async()=>{
 let saved,checkout,uploaded=false;
 const chain={insert(value){saved=value;return this},select(){return this},single:async()=>({data:{id:'fixture-order'}}),update(){return this},eq(){return this},is:async()=>({error:null}),then(resolve){return Promise.resolve({error:null}).then(resolve)}};
 const db={from:()=>chain,storage:{from:()=>({upload:async()=>{uploaded=true;return {error:null}}})}};
 const stripe={checkout:{sessions:{create:async(value)=>{checkout=value;return {id:'cs_fixture',url:'https://checkout.stripe.com/fixture'}}}}};
 const context={exports:{},console,URL,File,Uint8Array,crypto:webcrypto,process:{env:{FOUNDATION_PAYMENTS_ENABLED:'true',FOUNDATION_STRIPE_SECRET_KEY:'fixture',SUPABASE_SECRET_KEY:'fixture'}},require(name){if(name==='next/server')return {NextResponse:{json:(data,options)=>Response.json(data,options)}};if(name==='@/lib/finance/stripe')return {stripeDatabase:()=>db};if(name==='@/lib/finance/foundation-stripe')return {foundationStripeClient:()=>stripe};throw Error(name)}};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/foundation/checkout/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,context);
 const form=new FormData();form.set('data',JSON.stringify({kind:'CONTRIBUTION',amountCents:5000,donorType:'BUSINESS',businessName:'Fixture Business',contactName:'Fixture Contact',email:'fixture@example.invalid',website:'https://example.invalid',phone:'555-0100',mailingAddress:'Fixture Address',recognitionConsent:true,agreed:true}));form.set('logo',new File([new Uint8Array([137,80,78,71,13,10,26,10])],'logo.png',{type:'image/png'}));
 const response=await context.exports.POST(new Request('https://www.dmvattack.com/api/foundation/checkout',{method:'POST',body:form,headers:{Origin:'https://www.dmvattack.com'}}));assert.equal(response.status,200);assert.equal(saved.business_name,'Fixture Business');assert.equal(saved.donor_details.phone,'555-0100');assert.equal(saved.donor_details.recognitionConsent,true);assert.equal(saved.status,'PENDING');assert.equal(uploaded,true);assert.equal(checkout.billing_address_collection,'required');assert.equal(checkout.invoice_creation.enabled,true);assert.ok(checkout.invoice_creation.invoice_data.footer.includes('does not certify'));
});
