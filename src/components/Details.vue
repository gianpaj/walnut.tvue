<template>
    <div class="video-details">
      <a href="{{ playingVideo['permalink'] }}" target="_blank">
        <h2 v-cloak>{{playingVideo['title']}}</h2>
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

import {onMounted} from 'vue';

export default {
  props: ['playing-video'],
  setup() {
    onMounted(() => {

    });
       
  },
}
</script>