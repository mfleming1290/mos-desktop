// Product policy composes optional SDK mechanics; persistence/reducer remain host-owned.
export function createGeometry(layout) {
  const unwrap=value=>{if('Err' in value)throw Error(value.Err);return value.Ok;};
  const workArea=area=>unwrap(layout({op:'work_area',viewport:{x:0,y:0,...area},reservations:[{edge:'bottom',extent:24}]})).usable;
  const recover=(bounds,minimum,area)=>unwrap(layout({op:'place',area:workArea(area),requested:bounds,
    policy:{minimum,preferred:minimum,reachable:{width:120,height:36},strict_fit:false,snap_distance:0},snaps:[]})).bounds;
  return {workArea,recover,preview(start,dx,dy,mode,minimum,area){return recover(mode==='move'?{...start,x:start.x+dx,y:start.y+dy}:{...start,width:Math.max(1,start.width+dx),height:Math.max(1,start.height+dy)},minimum,area);}};
}
