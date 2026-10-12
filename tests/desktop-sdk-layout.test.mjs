import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {createLayout} from '../runtime/layout.mjs';
import {createGeometry} from '../page/src/desktop-sdk-layout.mjs';
const geometry=createGeometry(await createLayout(readFileSync(new URL('../runtime/layout.wasm',import.meta.url))));
test('real SDK reserves strip, recovers bounds and preserves preview input',()=>{
  const area={width:800,height:600},minimum={width:160,height:130};
  assert.deepEqual(geometry.workArea(area),{x:0,y:0,width:800,height:576});
  const start={x:700,y:550,width:200,height:180},before={...start};
  const moved=geometry.preview(start,50,50,'move',minimum,area);
  assert.deepEqual(start,before);assert.equal(moved.x,600);assert.equal(moved.y,396);
  const resized=geometry.preview(start,-500,-500,'resize',minimum,area);
  assert.equal(resized.width,160);assert.equal(resized.height,130);
  assert.throws(()=>geometry.recover({...start,x:NaN},minimum,area));
});
