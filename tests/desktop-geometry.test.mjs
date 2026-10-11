import test from 'node:test';
import assert from 'node:assert/strict';
import {recoverBounds, previewBounds} from '../page/src/desktop-geometry.mjs';
test('offscreen recovery retains reachable title bar and minimum sizes in small viewports',()=>{
  const min={width:280,height:180}, area={width:100,height:80};
  const bounds=recoverBounds({x:900,y:-40,width:20,height:10},min,area);
  assert.deepEqual(bounds,{x:0,y:0,width:280,height:180});
  assert.deepEqual(previewBounds(bounds,-100,-100,'resize',min,area),bounds);
});
