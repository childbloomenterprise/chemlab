import test from 'node:test';
import assert from 'node:assert/strict';
import { moleculeData } from './molecules.js';

test('acetone model has C3H6O formula and valid valences including a carbonyl double bond',()=>{
  const {atoms,bonds}=moleculeData('acetone');
  const counts=atoms.reduce((acc,a)=>(acc[a.element]=(acc[a.element]||0)+1,acc),{});
  assert.deepEqual(counts,{C:3,O:1,H:6});
  const valence=atoms.map(()=>0);
  for(const [a,b,order] of bonds){valence[a]+=order;valence[b]+=order;}
  atoms.forEach((atom,i)=>assert.equal(valence[i],{C:4,O:2,H:1}[atom.element]));
});
test('benzene model has six planar carbons in a closed aromatic ring and six attached hydrogens',()=>{
  const {atoms,bonds,aromatic}=moleculeData('benzene');assert.equal(aromatic,true);
  assert.equal(atoms.filter(a=>a.element==='C').length,6);assert.equal(atoms.filter(a=>a.element==='H').length,6);
  assert.ok(atoms.every(a=>a.p[2]===0));
  for(let i=0;i<6;i++){assert.ok(bonds.some(([a,b])=>a===i&&b===(i+1)%6));assert.ok(bonds.some(([a,b])=>a===i&&b===i+6));}
});
