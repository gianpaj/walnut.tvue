<template>
  <!-- FIXME: hack -->
  <div class="hidden"><YouTube ref="yt" src="" /></div>
  <div class="embed-container" @click="test">
    <YouTube
      ref="player"
      :width="width"
      :height="height"
      :src="link"
      :vars="playerVars"
      @ready="onPlayerReady"
      @state-chage="onPlayerStateChange"
      @error="onPlayerError"
    />
  </div>
</template>

<script>
/* eslint-disable vue/prop-name-casing */
import { ref, computed } from 'vue';
import YouTube from 'vue3-youtube';

export default {
  components: { YouTube },
  props: {
    'video-list': {
      type: Array,
      required: true,
    },
    autoplay: {
      type: Boolean,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    'playing-video': {
      type: Object,
      required: true,
    },
    'video-message': {
      type: String,
      required: true,
    },
  },
  emits: ['next', 'play'],
  setup(props, context) {
    // using `toRefs` to create a Reactive Reference to props
    const height = ref('390');
    const width = ref('640');
    const player = ref();
    const link = computed(
      () => props.playingVideo && `https://www.youtube.com/watch?v=${props.playingVideo.youtubeId}`
    );

    const test = function () {};

    // eslint-disable-next-line no-unused-vars
    const playerVars = ref({
      controls: 1,
      showinfo: 0,
      rel: 0,
      // video annotations
      iv_load_policy: 3,
      origin: 'http://localhost:3000',
      // origin: 'https://walnut.tv',
    });

    // Methods
    const nextVideo = function () {
      //watchEffect(() => {
      // eslint-disable-next-line no-undef
      context.emit('next');
      //})
    };

    function onPlayerReady() {
      // if we're playing a specific video (e.g. /general/b97ih5)
      props.videoList[props.index] && context.emit('play', props.index, player.value);
    }
    function onPlayerError() {
      console.log('onPlayerError');
      nextVideo();
    }
    function onPlayerStateChange(t) {
      console.log('onPlayerStateChange', t);
      0 === t.data && props.autoplay && nextVideo();
    }

    // eslint-disable-next-line no-undef
    return {
      width,
      height,
      player,
      onPlayerReady,
      onPlayerError,
      onPlayerStateChange,
      link,
      test,
      playerVars,
    };
  },
};
</script>