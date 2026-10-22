import {test} from 'node:test';
import assert from 'node:assert/strict';
import {total,compare,validateMatch} from '../src/logic.js';
test('two goals and one assist count as three scorers for the owner only',()=>{assert.deepEqual(total([{ownerUid:'a',goals:2,assists:1},{ownerUid:'b',goals:10,assists:5}],'a'),{goals:2,assists:1,scorers:3})});
test('overachievement wins and equivalent ratios tie exactly',()=>{assert.equal(compare(22,20,19,20),1);assert.equal(compare(1,3,2,6),0);assert.equal(compare(19,20,22,20),-1)});
test('reject empty opponent, negative and fractional scores',()=>{const m={playedOn:'2026-10-21',opponent:'FC Test',goals:2,assists:1};assert.ok(validateMatch(m));for(const bad of [{opponent:' '},{goals:-1},{assists:1.5},{playedOn:'bad'}])assert.equal(validateMatch({...m,...bad}),false)});
