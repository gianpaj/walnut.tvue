<template>
  <div v-show="!mobile" class="sidebar hidden-sm hidden-xs">
    <ul id="toolbox" class="video-list list-unstyled pre-scrollable">
      <li v-for="(video, index) in videoList" v-cloak :key="video.id" class="video" data-video-id="{{ index }}">
        <a :class="{ active: videoPlaying == index }" @click="play(index)">
          <div class="video-thumbnail-image hidden-xs">
            <span v-show="hasBeenWatched(video.youtubeId)" class="video-watched">WATCHED</span>
            <img class="video-image" :src="toUrl(video.youtubeId)" alt="{!! video.title !!}" />
          </div>
          <div class="video-title" :title="video.title" :class="{ watched: hasBeenWatched(video.youtubeId) }">
            <h4>{{ maxChar(video.title) }}</h4>
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import jQuery from 'jquery';

export default {
  props: ['video-list', 'mobile', 'video-playing', 'videos-watched'],
  emits: ['play'],
  // eslint-disable-next-line no-unused-vars
  setup(props, context) {
    const play = function (i) {
      context.emit('play', i);
    };

    const maxChar = function (t) {
      var e = t;
      return (
        void 0 != e && e.length > 90 && (e = jQuery.trim(e).substring(0, 80).split(' ').slice(0, -1).join(' ') + '...'),
        e
      );
    };

    const toUrl = function (t) {
      return 'https://img.youtube.com/vi/' + t + '/mqdefault.jpg';
    };

    const hasBeenWatched = function (youtubeId) {
      return -1 != props.videosWatched.indexOf(youtubeId) && youtubeId != props.videoList[props.videoPlaying].youtubeId;
    };

    return { toUrl, maxChar, hasBeenWatched, play };
  },
};
</script>