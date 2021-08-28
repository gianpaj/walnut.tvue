<template>
  <div class="video-details">
    <a href="{{ playingVideo['permalink'] }}" target="_blank">
      <h2 v-cloak>{{ playingVideo['title'] }}</h2>
    </a>
    <img
      alt="share"
      title="share"
      class="share-icon pull-left"
      src="../assets/share.svg"
      @click="share(playingVideo)"
    />
  </div>
</template>

<script>
import { onMounted } from 'vue';
//import $ from 'jquery'

export default {
  props: ['playing-video', 'channel'],
  setup(props) {
    onMounted(() => {});

    const share = function (video) {
      let url;
      if (props.channel && props.playingVideo.permalink.includes('reddit.com')) {
        url = `https://walnut.tv/${props.channel}/${video.id}`;
      } else {
        // YouTube
        url = props.playingVideo.permalink;
      }

      // eslint-disable-next-line no-undef
      $('#shareModal').modal('show');
      // eslint-disable-next-line no-undef
      $('#url-text')[0].value = url;
    };
    return { share };
  },
};
</script>