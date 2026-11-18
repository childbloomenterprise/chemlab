import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,advance,selectStage} from './lesson.js';
test('ten minutes never advances a stage automatically',()=>{for(let step=0;step<5;step++){const end=advance(selectStage(initialState(),step),600);assert.equal(end.step,step);assert.equal(end.playing,true);}});
test('pause freezes animation',()=>{const s={...selectStage(initialState(),3),playing:false,elapsed:7};assert.equal(advance(s,100),s);});
test('manual selection restarts the chosen animation',()=>{const s=selectStage({...initialState(),elapsed:300},2);assert.equal(s.step,2);assert.equal(s.elapsed,0);assert.equal(s.playing,true);});
test('selection stays within lesson',()=>{assert.equal(selectStage(initialState(),9).step,4);assert.equal(selectStage(initialState(),-1).step,0);});
