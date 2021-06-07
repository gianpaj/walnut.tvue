import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// eslint-disable-next-line no-undef
createApp(App).use(router).component('v-select', VueSelect.VueSelect).mount('#app') /*.config.unsafeDelimiters = ['{!!', '!!}'].config.debug = false
    .component('v-select', VueSelect.VueSelect)
    .filter('maxChar', function(t) {
      var e = t;
      return (
        void 0 != e &&
          e.length > 90 &&
          (e =
            jQuery
              .trim(e)
              .substring(0, 80)
              .split(' ')
              .slice(0, -1)
              .join(' ') + '...'),
        e
      );
    })
    .filter('toUrl', function(t) {
      return 'https://img.youtube.com/vi/' + t + '/mqdefault.jpg';
    })
    .filter('shortNumber', function(n) {
      return shortNumber(n);
    });
*/