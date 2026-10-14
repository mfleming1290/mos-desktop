export const streamAdapter=Object.freeze({id:'selkies',validate:(c,t)=>t==='personal'&&c&&Object.keys(c).length===1&&c.resource==='personal',
 availability:()=>({code:'available',message:'Existing personal session only. Fresh owner/role checked by gateway at Connect; local viewport scaling, no dynamic desktop resize or independent sessions.'})});
