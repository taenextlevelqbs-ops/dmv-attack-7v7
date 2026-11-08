import test from 'node:test';
import assert from 'node:assert/strict';
import {TRYOUT_EVENTS,TRYOUT_LOCATION,TRYOUT_TIME,TRYOUT_JSON_LD,STRIPE_TRYOUT_URL,tryoutForDivision,validConfirmation} from '../lib/tryouts.mjs';
test('confirmed tryout dates are Sundays with exact EST times and correct division mappings',()=>{
 assert.equal(TRYOUT_EVENTS.length,2);assert.equal(TRYOUT_TIME,'3:00–4:30 PM');
 assert.deepEqual(TRYOUT_EVENTS.map(e=>e.date),['2026-11-08','2026-11-22']);
 for(const e of TRYOUT_EVENTS){assert.equal(new Date(e.start).getUTCDay(),0);assert.equal(new Date(e.end)-new Date(e.start),90*60*1000);assert.equal(new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).format(new Date(e.start)),'3:00 PM');assert.ok(e.start.endsWith('-05:00'));}
 for(const division of ['10U','12U','14U'])assert.equal(tryoutForDivision(division).date,'2026-11-08');
 for(const division of ['15U','18U'])assert.equal(tryoutForDivision(division).date,'2026-11-22');
 assert.equal(tryoutForDivision('8U'),null);assert.equal(TRYOUT_LOCATION.street,'23115 Learning Circle');assert.equal(TRYOUT_LOCATION.city,'Ashburn');assert.equal(TRYOUT_LOCATION.postalCode,'20148');
});
test('SEO event schema agrees with the visible event schedule and $20 price',()=>{
 for(const [i,e]of TRYOUT_EVENTS.entries()){assert.equal(TRYOUT_JSON_LD[i].startDate,e.start);assert.equal(TRYOUT_JSON_LD[i].endDate,e.end);assert.equal(TRYOUT_JSON_LD[i].offers.price,20);assert.equal(TRYOUT_JSON_LD[i].offers.priceCurrency,'USD');}
 assert.equal(STRIPE_TRYOUT_URL,'https://buy.stripe.com/5kQfZa9Op1yj2Cq0yt3F600');
});
test('confirmation contains only bounded registration display data, never payment claims',()=>{
 assert.equal(validConfirmation({id:'DMV-001',athlete:'Example Athlete',division:'12U'}),true);
 for(const value of [null,{},{id:'',athlete:'Example',division:'12U'},{id:'DMV',athlete:'x'.repeat(201),division:'12U'},{id:'DMV',athlete:'Example',division:'8U'}])assert.equal(validConfirmation(value),false);
});
