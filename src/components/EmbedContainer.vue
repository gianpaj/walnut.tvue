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
import { ref, onMounted, computed } from 'vue';
import YouTube from 'vue3-youtube';

export default {
  components: { YouTube },
  props: ['video-list', 'autoplay', 'index', 'video-message', 'playing-video'],
  emits: ['next', 'play'],
  setup(props, context) {
    //Data
    const height = ref('390');
    const width = ref('640');
    const player = ref();
    /*const videoId = ref(youtubeId);
    const events = ref({
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    });
    const playerVars = ref({
      controls: 1,
      showinfo: 0,
      rel: 0,
      iv_load_policy: 3,
      origin: 'https://walnut.tv',
    });*/
    //const link = ref(null);
    const link = computed(() => {
      return `https://www.youtube.com/watch?v=${props.playingVideo.youtubeId}`;
    });

    const test = function () {
      // eslint-disable-next-line no-undef
      console.log(link.value);
    };
    onMounted(() => {
      //link.value = `https://www.youtube.com/watch?v=${props.playingVideo.youtubeId}`;
    });
    // eslint-disable-next-line no-unused-vars
    const videoId = ref(props.playingVideo.youtubeId);
    // eslint-disable-next-line no-unused-vars
    const events = ref({
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    });
    // eslint-disable-next-line no-unused-vars
    const playerVars = ref({
      controls: 1,
      showinfo: 0,
      rel: 0,
      iv_load_policy: 3,
      origin: 'http://localhost:8080',
    });

    //Methods
    // eslint-disable-next-line no-unused-vars
    const play = function (i) {
      // eslint-disable-next-line no-undef
      context.emit('play', i);
    };
    const nextVideo = function () {
      //watchEffect(() => {
      // eslint-disable-next-line no-undef
      context.emit('next');
      //})
    };

    function onPlayerReady() {
      // if we're playing a specific video (e.g. /general/b97ih5)
      props.videoList[props.indexToPlay] && play(props.indexToPlay);
    }
    function onPlayerError() {
      nextVideo();
    }
    function onPlayerStateChange(t) {
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
};
</script>