<template>
    <div class="embed-container">
      <div class="videoPlayer">
        <youtube video-id="lG0Ys-2d4MA" :width="width" :height="height" ref="youtube"></youtube>
      </div>
    </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: ['video-list', 'autoplay', 'index'],
  setup(props) {
    //Data
    var youtubeId;
    const height = ref('390')
    const width = ref('640')
    // eslint-disable-next-line no-unused-vars
    const videoId = ref(youtubeId)
    // eslint-disable-next-line no-unused-vars
    const events = ref({
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        })
    // eslint-disable-next-line no-unused-vars
    const playerVars = ref({
          controls: 1,
          showinfo: 0,
          rel: 0,
          iv_load_policy: 3,
          origin: 'https://walnut.tv',
        })

    //Methods
    // eslint-disable-next-line no-unused-vars
    //var indexToPlay = 0;
    const play = function(i) {
        this.playingVideo = this.videoList[i];
        this.videoPlaying = i;
        this.voted = 0;
        this.watched(this.playingVideo.youtubeId);
        this.playVideo(this.playingVideo);
        if (!this.channel) return;
        if (this.playingVideo.permalink.includes('reddit.com')) {
          window.history.replaceState(null, null, '/' + this.channel + '/' + this.playingVideo.id);
        }
      }
    const nextVideo = function() {
        if (this.videoPlaying >= this.videoList.length - 1) {
          return;
        }
        this.videoPlaying++;
        this.play(this.videoPlaying);
        this.scroll(1);
    }
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

    return {width, height}
  }
}
</script>