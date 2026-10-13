// Product templates describe existing actions; they confer no permission or session authority.
export function shellTemplate(applications) {
 const p=(relative_to,x,y,width,height,align_x=0,align_y=0,stretch_x=false,stretch_y=false)=>({relative_to,x,y,width,height,align_x,align_y,stretch_x,stretch_y});
 const elements=[{id:'strip',kind:'region',label:'Shell',editable:false,position:p('reservation-0',0,0,1,24,0,0,true)},
 {id:'workspace',kind:'region',label:'Applications',editable:false,position:p('work-area',0,0,1,1,0,0,true,true)},
 {id:'start',kind:'item',label:'Start',editable:false,position:p('strip',0,0,70,24)},
 {id:'calendar',kind:'item',label:'Calendar',editable:false,position:p('strip',-2,0,90,24,1)},
 {id:'context',kind:'item',label:'Context',editable:false,position:p('strip',76,0,90,24)}];
 const surfaces=['start','calendar','context'].map(id=>({id:id+'-surface',kind:'transient',role:id==='context'?'menu':'dialog',size:{width:280,height:id==='start'?300:160},side:'top'}));
 const triggers=['start','calendar','context'].map(id=>({id:id+'-trigger',element:id,action:id,surface:id+'-surface'}));
 applications.forEach((app,i)=>{
  const id='open-'+app.id;
  elements.push({id,kind:'item',label:app.display_name,editable:true,position:{...p('workspace',0,0,112,56),grid:{grid:'applications',column:i%4,row:Math.floor(i/4),columns:1,rows:1}}});
  surfaces.push({id:id+'-surface',kind:'full',role:'window',size:{width:320,height:240},side:'right'});
  triggers.push({id:id+'-trigger',element:id,action:id,surface:id+'-surface'});
 });
 return{version:1,id:'mos-shell',elements,surfaces,triggers,reservations:[{edge:'bottom',extent:24}],grids:[{id:'applications',region:'workspace',columns:4,rows:4,cell:{width:112,height:56},gap:8,padding:8}]};
}
