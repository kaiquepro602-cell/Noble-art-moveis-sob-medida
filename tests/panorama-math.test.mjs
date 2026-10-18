import test from 'node:test';
import assert from 'node:assert/strict';
import {cameraView, normalizeYaw, projectHotspot, radians} from '../dist/panorama-math.mjs';

test('rotation crosses the rear seam and accepts repeated full turns',()=>{
  assert.equal(normalizeYaw(181),-179);
  assert.equal(normalizeYaw(-181),179);
  for(const turns of [-100,-2,-1,0,1,2,100])assert.equal(normalizeYaw(23+360*turns),23);
});
test('a detail aligned with the camera stays in the center in every direction',()=>{
  for(const [width,height] of [[390,560],[760,740],[1440,700]])for(const yaw of [-179,-90,0,90,179])for(const pitch of [-70,-20,0,20,70]){
    const point=projectHotspot({yaw,pitch},cameraView({width,height,yaw,pitch}));
    assert.equal(point.visible,true);
    assert.ok(Math.abs(point.x-width/2)<1e-7);
    assert.ok(Math.abs(point.y-height/2)<1e-7);
  }
});
test('details behind the camera are hidden, including across the rear seam',()=>{
  assert.equal(projectHotspot({yaw:180,pitch:0},cameraView({width:800,height:600})).visible,false);
  assert.equal(projectHotspot({yaw:-179,pitch:0},cameraView({width:800,height:600,yaw:179})).visible,true);
});
test('portrait and landscape cameras retain bounded fields of view and zoom',()=>{
  for(const [width,height] of [[320,390],[390,560],[1440,500]]){
    const normal=cameraView({width,height}),close=cameraView({width,height,zoom:2});
    assert.ok(normal.vfov<=82*radians+1e-10);
    assert.ok(normal.hfov<=95*radians+1e-10);
    assert.ok(close.vfov<normal.vfov);
    assert.ok(close.hfov<normal.hfov);
    assert.equal(cameraView({width,height,pitch:500}).pitch,80);
    assert.equal(cameraView({width,height,pitch:-500}).pitch,-80);
  }
});

