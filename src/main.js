import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueYoutube from 'vue-youtube'

createApp(App).use(router).use(VueYoutube).mount('#app')
