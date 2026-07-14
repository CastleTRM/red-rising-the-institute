/* ============================================================================
   INSTITUTE_3D — animated 3D Spartan foot-soldiers for the ground battle.
   Paste this ENTIRE block inline into index.html, INSIDE the main game <script>
   (it must share scope with the battle code: it references HOUSES, B, B3, b3H).
   Put it just ABOVE the definition of b3Frame / b3SetupBattle.
   Do NOT ship it as a separate external <script src> — it needs closure access
   to the battle functions and globals, which an external file cannot reach.
   ========================================================================== */
var INSTITUTE_3D=(function(){
 var mobile=/Mobi|Android|iPhone|iPad/i.test((navigator&&navigator.userAgent)||"");
 var enabled=!mobile, ready=false, loading=false, tmpl=null, clips={}, mixers=[], last=0;
 var FOOT={pike:1,blade:1,conscript:1,captain:1,howler:1,vanguard:1,champion:1};
 var SCALE=7.0, PERUNIT=6, FIELD=36, YAW=0.0;
 function load(){ if(loading||ready||!window.THREE||!THREE.GLTFLoader)return; loading=true; try{ new THREE.GLTFLoader().load("assets/models/spartan-lite.glb",function(g){ tmpl=g.scene; (g.animations||[]).forEach(function(c){clips[c.name]=c;}); ready=true; },undefined,function(){loading=false;}); }catch(e){loading=false;} }
 function isFoot(t){return enabled&&!!FOOT[t];}
 function tick(){ try{ if(!enabled)return; if(!ready){load();return;} var now=((window.performance&&performance.now)?performance.now():Date.now())/1000; var dt=last?Math.min(0.06,now-last):0; last=now; for(var i=0;i<mixers.length;i++)mixers[i].update(dt); }catch(e){} }
 function make(hid){ if(!ready||!(window.THREE&&THREE.SkeletonUtils))return null; var obj=THREE.SkeletonUtils.clone(tmpl); obj.scale.setScalar(SCALE); obj.traverse(function(o){ if(o.isMesh){o.frustumCulled=false; if(o.material){o.material=o.material.clone(); if(o.material.name&&o.material.name.indexOf("Armor7")>=0){try{o.material.color=new THREE.Color((HOUSES[hid]||HOUSES.neutral).color);}catch(e){}}}}}); var mx=new THREE.AnimationMixer(obj); mixers.push(mx); var acts={}; for(var k in clips){acts[k]=mx.clipAction(clips[k]);} var cur=null; function setState(n){var a=acts[n]||acts.idle; if(!a||a===cur)return; if(cur)cur.fadeOut(0.15); a.reset().fadeIn(0.15).play(); cur=a;} setState("idle"); return {obj:obj,setState:setState}; }
 function clearAll(){ mixers.length=0; last=0; }
 function renderUnit(rec,u,show,sinF,cosF){ try{ if(!ready)return false; if(!rec.s3d)rec.s3d=[]; var want=Math.min(show,PERUNIT); var st=u.rout?"death":(u.mv?"march":(((B.t-(u.lastHit||-9))<0.5)?"attack":"idle")); var gy=b3H(u.x,u.y), face=-u.face+YAW; for(var i=0;i<want;i++){ var sN=rec.s3d[i]; if(!sN){ if(mixers.length>=FIELD)break; sN=make(u.hid); if(!sN)break; B3.unitGrp.add(sN.obj); rec.s3d[i]=sN; } var o=u.offs[i]; sN.obj.position.set(u.x-o.x*sinF-o.y*cosF-600, gy, u.y+o.x*cosF-o.y*sinF-340); sN.obj.rotation.y=face; sN.obj.visible=true; sN.setState(st); } for(var j=want;j<rec.s3d.length;j++)rec.s3d[j].obj.visible=false; if(rec.s3d.length>0){ rec.inst.visible=false; if(rec.spr){for(var q=0;q<rec.spr.length;q++)rec.spr[q].visible=false;} return true; } return false; }catch(e){ return false; } }
 return { get enabled(){return enabled;}, set enabled(v){enabled=v;}, get ready(){return ready;}, load:load, tick:tick, isFoot:isFoot, renderUnit:renderUnit, clearAll:clearAll, cfg:function(o){o=o||{};if(o.scale!=null)SCALE=o.scale;if(o.per!=null)PERUNIT=o.per;if(o.field!=null)FIELD=o.field;if(o.yaw!=null)YAW=o.yaw;} };
})();
