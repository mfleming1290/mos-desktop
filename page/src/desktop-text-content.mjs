import {defineComponent,h,ref} from 'vue';
// E11: fourth reviewed type needs only this module and composition registration.
export const textAdapter=Object.freeze({id:'text',validate:(c,t)=>t==='plain'&&c&&Object.keys(c).length===1&&typeof c.text==='string'&&c.text.length<=8192,
 availability:()=>({code:'available',message:'Trusted local editable text; no backend or file authority'}),
 component:defineComponent({props:['config','active'],setup(props){const draft=ref(props.config.text);return ()=>h('textarea',{'aria-label':'Text draft',value:draft.value,onInput:e=>draft.value=e.target.value,style:'width:100%;height:100%',disabled:!props.active});}})});
