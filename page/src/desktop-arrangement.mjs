// MOS policy composes the approved Rust layout interface. No second solver.
export function createArrangement(layout) {
  const unwrap = result => {if ('Err' in result) throw new Error(result.Err); return result.Ok;};
  const apply = (composition, operation) => unwrap(layout({op:'composition_apply',composition,operation}));
  function sync(composition, windows) {
    let next = composition ?? {version:1,mode:'freeform',floating:[],tiled:{version:1,root:null}};
    const ids = new Set(windows.map(w=>w.id));
    const tiled = new Set();
    function visit(node) {if (!node) return;if(node.kind==='split'){visit(node.first);visit(node.second);}else for(const id of node.kind==='tabs'?node.views:[node.view])tiled.add(id);}
    visit(next.tiled.root);
    for (const old of next.floating) if (!ids.has(old.view) && tiled.has(old.view)) {
      next = apply(next,{kind:'undock',view:old.view});tiled.delete(old.view);
    }
    next = {...next,floating:windows.map(w=>{
      const old = next.floating.find(f=>f.view===w.id);
      return {view:w.id,bounds:old ? old.bounds : {...(w.restoredBounds ?? w.bounds)}};
    })};
    const groups=[];
    function collect(node){if(!node)return;if(node.kind==='split'){collect(node.first);collect(node.second);}else if(node.kind==='tabs')groups.push(node);}
    collect(next.tiled.root);
    for(const group of groups){
      const eligible=id=>windows.some(w=>w.id===id && w.visible && w.presentation.kind!=='MINIMIZED');
      if(!eligible(group.active)){
        const fallback=group.views.find(eligible);
        if(fallback)next=apply(next,{kind:'tree',operation:{kind:'select',node:group.id,view:fallback}});
      }
    }
    return next;
  }
  function preset(composition, windows, mode) {
    let next = sync(composition,windows);
    if (mode==='freeform') return apply(next,{kind:'mode',mode});
    // Product presets are assembled from SDK intent operations, never stored as SDK policy.
    next = {...next,mode:'tiled',tiled:{version:1,root:null}};
    const eligible = windows.filter(w=>w.visible && w.presentation.kind!=='MINIMIZED');
    if (!eligible.length) return next;
    const first = eligible[0].id;
    next = apply(next,{kind:'seed',view:first,leaf:`leaf:${first}`});
    let target = `leaf:${first}`;
    for (const [index,window] of eligible.slice(1).entries()) {
      next = apply(next,{kind:'dock',view:window.id,target,side:mode==='tabs'?'tab':'right',
        node:`split:${window.id}`,leaf:`leaf:${window.id}`,index:index+1});
      if (mode!=='tabs') target=`leaf:${window.id}`;
    }
    return next;
  }
  function project(composition, windows, area, minimum) {
    return unwrap(layout({op:'composition_project',composition,viewport:{x:0,y:0,...area},
      reservations:[{edge:'bottom',extent:24}],constraints:windows.map(w=>({view:w.id,minimum:minimum(w)})),gap:6,
      policy:{minimum:{width:1,height:1},preferred:{width:300,height:220},reachable:{width:120,height:36},strict_fit:false,snap_distance:0}}));
  }
  function dock(composition,windows,source,target,side) {
    let next=sync(composition,windows);
    if(source===target || !windows.some(w=>w.id===source) || !windows.some(w=>w.id===target))throw new Error('Choose two different windows');
    function group(node){if(!node)return null;if(node.kind==='split')return group(node.first)??group(node.second);return (node.kind==='tabs'?node.views:[node.view]).includes(target)?node.id:null;}
    let targetGroup=group(next.tiled.root);
    if(!targetGroup){
      if(next.tiled.root)throw new Error('Dock target must already be tiled; use Tile windows first');
      next=apply(next,{kind:'seed',view:target,leaf:`leaf:${target}`});targetGroup=`leaf:${target}`;
    }
    return apply(next,{kind:'dock',view:source,target:targetGroup,side,
      node:`dock:${source}`,leaf:`docked:${source}`,index:0});
  }
  function restore(value, mapping) {
    const restored = layout({op:'restore_composition',value});
    if (restored.code!=='supported') throw new Error('Unsupported arrangement; original record preserved');
    const remap = id => {if(!mapping.has(id))throw new Error('Arrangement references unavailable view');return mapping.get(id);};
    const tree = node => !node ? null : node.kind==='split' ? {...node,first:tree(node.first),second:tree(node.second)}
      : node.kind==='tabs' ? {...node,views:node.views.map(remap),active:remap(node.active)} : {...node,view:remap(node.view)};
    const next = {...restored.composition,floating:restored.composition.floating.map(f=>({...f,view:remap(f.view)})),
      tiled:{version:1,root:tree(restored.composition.tiled.root)}};
    if(new Set(next.floating.map(f=>f.view)).size!==mapping.size)throw new Error('Incomplete arrangement membership');
    return next;
  }
  return {apply,sync,preset,project,restore,dock};
}
