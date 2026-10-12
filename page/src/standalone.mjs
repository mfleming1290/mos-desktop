import {createApp} from 'vue';
import Plugin from './Plugin.vue';
// Same-origin MOS authentication only; no password form, token copy or new issuer.
createApp(Plugin,{requireAuthenticated:true}).mount('#app');
