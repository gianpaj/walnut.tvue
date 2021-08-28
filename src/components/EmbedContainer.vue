<template>
  <div class="embed-container" @click="test">
    <div class="videoPlayer">
      <YouTube
        ref="player"
        :src="link"
        :width="width"
        :height="height"
        :vars="playerVars"
        @ready="onPlayerReady"
        @state-chage="onPlayerStateChange"
        @error="onPlayerError"
      />
    </div>
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
    const height = ref('390');
    const width = ref('640');
    const player = ref();
    // const videoId = ref(youtubeId);
    //const link = ref(null);
    const link = computed(() => `https://www.youtube.com/watch?v=${props.playingVideo.value?.youtubeId}`);

    const test = function () {};

    // eslint-disable-next-line no-unused-vars
    const videoId = ref(props.playingVideo.value?.youtubeId);
    // eslint-disable-next-line no-unused-vars
    const events = ref({
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    });
    // eslint-disable-next-line no-unused-vars
    const playerVars = ref({
      // autoplay: 1,
      controls: 1,
      showinfo: 0,
      rel: 0,
      // video annotations
      iv_load_policy: 3,
      // origin: 'http://localhost:3000',
      // origin: 'https://walnut.tv',
    });

    //Methods
    // eslint-disable-next-line no-unused-vars
    const play = (i) => {
      console.log('e play', i, player);
      // eslint-disable-next-line no-undef
      context.emit('play', i, player);
    };
    const nextVideo = function () {
      //watchEffect(() => {
      // eslint-disable-next-line no-undef
      context.emit('next');
      //})
    };

    function onPlayerReady() {
      console.log(props.playingVideo.value);
      // if we're playing a specific video (e.g. /general/b97ih5)
      props.videoList[props.index] && play(props.index, player.value);
      // console.log('onready', props.index, player);
      // console.log('onready', props.index, this.$refs.player);

      return true;
    }
    function onPlayerError() {
      console.log('onPlayerError');
      nextVideo();
    }
    function onPlayerStateChange(t) {
      console.log('onPlayerStateChange');
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
      play,
      playerVars,
    };
  },

  mounted() {
    this.onPlayerReady();
    //link.value = `https://www.youtube.com/watch?v=${props.playingVideo.youtubeId}`;
  },
};
</script>