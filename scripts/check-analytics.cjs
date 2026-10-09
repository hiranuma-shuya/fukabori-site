const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync('analytics.js', 'utf8');
function run(hostname, dnt = '0') {
  const events = [], handlers = {}, scripts = [];
  const client = {register: props => events.push(['register', props]), capture: (...args) => events.push(args)};
  const sandbox = {
    location:{hostname,pathname:'/fukabori-site/'},navigator:{doNotTrack:dnt},
    document:{addEventListener:(event,fn) => handlers[event]=fn,createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}},
    window:{addEventListener:(event,fn)=>handlers[event]=fn,posthog:{init:(key,config)=>config.loaded(client)}}
  };
  vm.runInNewContext(source, sandbox);
  return {events,handlers,scripts};
}
// Development traffic and DNT do not load the SDK or install tracking listeners.
for (const result of [run('127.0.0.1'),run('hiranuma-shuya.github.io','1')]) {
  assert.equal(result.scripts.length,0); assert.equal(Object.keys(result.handlers).length,0);
}
const r=run('hiranuma-shuya.github.io');
assert.equal(r.scripts.length,1);
const click={target:{closest:()=>({dataset:{storeCta:'hero'}})}};
// An interaction after a delayed SDK download is replayed without blocking navigation.
r.handlers.click(click); assert.equal(r.events.length,0);
r.scripts[0].onload();
assert.equal(r.events[0][0],'register');assert.equal(r.events[0][1].lp_version,'acquisition-v1');
assert.equal(r.events[1][0],'$pageview');
assert.equal(r.events[2][0],'lp_store_click');
assert.equal(r.events[2][1].cta_position,'hero');
assert.equal(r.events[2][2].transport,'sendBeacon');assert.equal(r.events[2][2].send_instantly,true);
r.handlers['fukabori:preview']({detail:{surface:'next_question',deck_id:'couple_v1',question_index:1}});
assert.equal(r.events[3][0],'lp_question_preview');assert.equal(r.events[3][1].deck_id,'couple_v1');
console.log('Analytics checks passed: preview/DNT exclusion, delayed init, pageview version, outgoing beacon, question interaction.');
