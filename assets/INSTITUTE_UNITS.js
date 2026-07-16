/* ============================================================================
   INSTITUTE_UNITS — drop-in unit assembler for the game (three.js r128).
   Builds a battle-ready unit = body (rigged+animated) + weapon on hand socket
   + shield on off-hand + house-colour tint, and drives its animation.

   Requires: THREE + GLTFLoader (+ SkeletonUtils if you clone many).
   Assets: bodies in assets/models/<id>.glb, weapons/shields in assets/attachments/<id>.glb.

   Usage:
     var u = INSTITUTE_UNITS.build({
        body:"infantry_male", weapon:"gladius", shield:"scutum",
        house:"mars", clip:"idle", onReady:function(group){ scene.add(group); }
     });
     // each frame:  INSTITUTE_UNITS.tick(dt);
     // change state: INSTITUTE_UNITS.play(u, "attack");   // idle|walk|run|attack|death
   ========================================================================== */
var INSTITUTE_UNITS=(function(){
  var BODY="assets/models/", ATT="assets/attachments/";
  var HOUSES={mars:0xb23b2e,minerva:0x3f6fa8,apollo:0xc8821b,pluto:0x75639b,ceres:0xa98a4f,
    diana:0x47795a,jupiter:0x7d8896,juno:0x8a5a6e,venus:0xb8788a,vulcan:0x8a4a2e,
    bacchus:0x6e3a4e,mercury:0x4a8f86,neutral:0x565b64};
  // Per-(body|item|socket) fine-tune, edited in rigged_units/placement_editor.html
  // and pasted here (Export all). Empty = use the weapon GLB's baked orientation.
  var PLACEMENTS={};
  var _mixers=[];
  var loader=(typeof THREE!=="undefined"&&THREE.GLTFLoader)?new THREE.GLTFLoader():null;

  // map a clip request (idle/walk/run/attack/death) to whatever the body actually has
  function pick(clips, want){
    var names=Object.keys(clips);
    var byKey=function(k){ for(var i=0;i<names.length;i++){ if(names[i].indexOf(k)>=0) return names[i]; } return null; };
    var order = want==="attack" ? ["attack_light","attack","slash"]
              : want==="death"  ? ["death_front","death","fall"]
              : want==="march"  ? ["walk"]
              : [want];
    for(var i=0;i<order.length;i++){ var n=byKey(order[i]); if(n) return n; }
    return byKey("idle") || names[0];
  }

  function tintHouse(root, house){
    if(!house) return;
    var col=new THREE.Color(HOUSES[house]||HOUSES.neutral);
    root.traverse(function(o){
      if(o.isMesh && o.material){
        var arr=Array.isArray(o.material)?o.material:[o.material];
        arr.forEach(function(m){ if(m.name==="house_cloth"){ o.material=m.clone(); o.material.color=col; o.material.needsUpdate=true; } });
      }
    });
  }

  function attach(root, socketName, assetId, folder, bodyId){
    if(!assetId) return;
    var socket=null; root.traverse(function(o){ if(o.name===socketName) socket=o; });
    if(!socket){ console.warn("INSTITUTE_UNITS: socket",socketName,"not found on",root.name); return; }
    loader.load((folder||ATT)+assetId+".glb", function(g){
      var adj=new THREE.Group();
      var p=PLACEMENTS[bodyId+"|"+assetId+"|"+socketName];
      if(p){
        adj.rotation.set(p.rot[0]*Math.PI/180, p.rot[1]*Math.PI/180, p.rot[2]*Math.PI/180);
        adj.position.set(p.pos[0]*100, p.pos[1]*100, p.pos[2]*100); // metres -> socket-local (0.01 armature scale)
        adj.scale.set(p.scale, p.scale, p.scale);
      }
      adj.add(g.scene); socket.add(adj);
    }, undefined, function(e){ console.warn("INSTITUTE_UNITS: weapon load failed",assetId,e); });
  }

  function build(opts){
    opts=opts||{}; var grp=new THREE.Group(); grp.name="unit_"+(opts.body||"?");
    if(!loader){ console.error("INSTITUTE_UNITS: THREE.GLTFLoader missing"); return grp; }
    loader.load(BODY+opts.body+".glb", function(g){
      grp.add(g.scene);
      var mixer=new THREE.AnimationMixer(g.scene); _mixers.push(mixer);
      grp.userData.mixer=mixer; grp.userData.actions={}; grp.userData.clips={}; grp.userData.cur=null;
      (g.animations||[]).forEach(function(c){ grp.userData.clips[c.name]=c; grp.userData.actions[c.name]=mixer.clipAction(c); });
      tintHouse(g.scene, opts.house);
      attach(g.scene, "socket_weapon_r", opts.weapon, ATT, opts.body);
      attach(g.scene, "socket_shield_l", opts.shield, ATT, opts.body);
      attach(g.scene, "socket_head", opts.helm, ATT, opts.body);
      attach(g.scene, "socket_back", opts.cloak, ATT, opts.body);
      play(grp, opts.clip||"idle");
      if(opts.onReady) opts.onReady(grp);
    }, undefined, function(e){ console.error("INSTITUTE_UNITS: body load failed",opts.body,e); });
    return grp;
  }

  function play(grp, want){
    var a=grp.userData&&grp.userData.actions; if(!a) return;
    var name=pick(grp.userData.clips, want); var act=a[name]; if(!act) return;
    if(grp.userData.cur===act) return;
    if(grp.userData.cur) grp.userData.cur.fadeOut(0.2);
    act.reset().fadeIn(0.2).play(); grp.userData.cur=act; grp.userData.state=want;
  }

  function tick(dt){ for(var i=0;i<_mixers.length;i++) _mixers[i].update(dt||0.016); }
  function clear(){ _mixers.length=0; }

  return { build:build, play:play, tick:tick, clear:clear, HOUSES:HOUSES };
})();
if(typeof module!=="undefined"){ module.exports=INSTITUTE_UNITS; }
