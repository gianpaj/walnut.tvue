<template>
  <div class="navbar navbar-inverse">
    <div class="header-container">
      <div class="navbar-header">
        <a class="navbar-brand" href="/">
          <img src="../assets/walnut-logo.svg" class="walnut-logo" alt="Walnut.tv Logo" />
        </a>
        <div class="hide-mobile-landscape hide-desktop collapse-container">
          <button
            aria-expanded="false"
            class="hide-mobile-landscape navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#navbar-collapse-1"
            type="button"
          >
            <span class="sr-only">Toggle navigation</span>
            <span>{{ channel }}</span>
          </button>
          <div id="navbar-collapse-1" class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
              <li v-for="item in channels" :key="item.id" :class="{ active: item.title == channel }">
                <a @click="changeChannel(item.title)"> {{ item.title }} </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="hide-mobile-portrait mobile-navbar-portrait">
          <ul class="nav navbar-nav">
            <li v-for="item in channels" :key="item.title" :class="{ active: item.title == channel }">
              <a @click="changeChannel(item.title)"> {{ item.title }} </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  props: ['channel', 'channels'],
  emits: ['change', 'change-channel'],
  setup(props, context) {
    const changeChannel = function (v) {
      //$('#navbar-collapse-1').collapse('hide');
      context.emit('change-channel', v);
    };

    return { changeChannel };
  },
};
</script>

