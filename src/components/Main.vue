<template>
  <div v-if="!loadingVideos">
    <div class="container">
      <SideBar
        :video-playing="videoPlaying"
        :mobile="mobile"
        :video-list="videoList"
        :videos-watched="videosWatched"
        @play="play"
      />

      <div class="main-content">
        <div id="video-container" class="video-container pre-scrollable">
          <EmbedContainer
            ref="youtube"
            :playing-video="playingVideo"
            :video-message="videoMessage"
            :video-list="videoList"
            :autoplay="autoplay"
            :index="indexToPlay"
            @play="play"
            @next="nextVideo"
          />
          <Details :playing-video="playingVideo" :channel="channel" />
          <div class="terms-container">
            <a class="terms" target="_black" href="https://www.youtube.com/t/terms">YouTube ToS</a> &nbsp;
            <a class="terms" target="_black" href="https://policies.google.com/privacy">Google Privacy Policy</a>
          </div>
          <div class="video-controls hide-desktop">
            <svg
              alt="previous"
              title="previous"
              class="prev-video pull-left"
              viewBox="0 0 292.362 292.362"
              @click="prevVideo()"
            >
              <!-- :class="{ disabled: videoPlaying < videoList.length }" -->
              <g>
                <path
                  d="M286.935,197.286L159.028,69.379c-3.613-3.617-7.895-5.424-12.847-5.424s-9.233,1.807-12.85,5.424L5.424,197.286
    C1.807,200.9,0,205.184,0,210.132s1.807,9.233,5.424,12.847c3.621,3.617,7.902,5.428,12.85,5.428h255.813
    c4.949,0,9.233-1.811,12.848-5.428c3.613-3.613,5.427-7.898,5.427-12.847S290.548,200.9,286.935,197.286z"
                />
              </g>
            </svg>
            <svg
              alt="next"
              title="next"
              class="next-video pull-right"
              viewBox="0 0 292.362 292.362"
              @click="nextVideo()"
            >
              <!-- :class="{ disabled: videoPlaying >= videoList.length - 1 }" -->
              <g>
                <path
                  d="M286.935,197.286L159.028,69.379c-3.613-3.617-7.895-5.424-12.847-5.424s-9.233,1.807-12.85,5.424L5.424,197.286
    C1.807,200.9,0,205.184,0,210.132s1.807,9.233,5.424,12.847c3.621,3.617,7.902,5.428,12.85,5.428h255.813
    c4.949,0,9.233-1.811,12.848-5.428c3.613-3.613,5.427-7.898,5.427-12.847S290.548,200.9,286.935,197.286z"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div v-cloak class="container">
      <h2 class="loadingMessage">
        Loading Videos <img src="../assets/spin.svg" class="loading" alt="Loading Videos" />
      </h2>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeUnmount } from 'vue';
import $ from 'jquery';
import ga from 'vue-ga';
import EmbedContainer from './EmbedContainer.vue';
import Details from './Details.vue';
import SideBar from './Sidebar.vue';

export default {
  name: 'Main',
  components: { EmbedContainer, Details, SideBar },
  props: ['youtube-service', 'reddit-service', 'mixed', 'search-input', 'channel', 'channels'],
  emits: ['set-channel', 'set-search-input'],

  setup(props, context) {
    var loadingVideosMessage = 'Loading Videos <img src="/img/spin.svg" class="loading" alt="Loading Videos">';

    //data
    const autoplay = ref(true);
    const contentType = ref(''); // 'youtube' or 'reddit'
    const loadingVideos = ref(true);
    const mobile = ref(false);
    const playingVideo = ref([]);
    const videoList = ref([]);
    const videoMessage = ref(loadingVideosMessage);
    const videoPlaying = ref(0);
    const videosWatched = ref([]);
    const voted = ref(0);
    const youtube = ref(null);

    // eslint-disable-next-line no-unused-vars
    const indexToPlay = ref(0);

    //methods
    const play = function (i) {
      playingVideo.value = videoList.value[i];
      videoPlaying.value = i;
      voted.value = 0;
      watched(playingVideo.value.youtubeId);
      playVideo(playingVideo.value);
      if (!props.channel) return;
      if (playingVideo.value.permalink.includes('reddit.com')) {
        window.history.replaceState(null, null, '/' + props.channel + '/' + playingVideo.value.id);
      }
    };
    // eslint-disable-next-line no-unused-vars
    const getSubReddits = function (channel) {
      return props.channels.find((c) => c.title == channel).subreddit;
    };
    // eslint-disable-next-line no-unused-vars
    const getYouTubeChannels = function (channel) {
      return props.channels.find((c) => c.title == channel).youtubeChannels;
    };
    // eslint-disable-next-line no-unused-vars
    const getChannelMinVotes = function (channel) {
      props.channels.find((c) => c.title == channel).minNumOfVotes;
    };
    // eslint-disable-next-line no-unused-vars
    const fetchAllVideos = function (channel, searchText) {
      if (!channel) {
        channel = 'general';
      }
      let id, minNumOfVotes, ytChannels, promises;
      let subreddits = searchText;
      const { pathname } = window.location;
      contentType.value = 'reddit';
      loadingVideos.value = true;
      videoMessage.value = loadingVideosMessage;
      if (!searchText) {
        if (pathname.split('/').length === 3) {
          id = pathname.split('/')[pathname.split('/').length - 1];
        }

        if (pathname.split('/r/').length > 1) {
          subreddits = channel;
          promises = Promise.all([props.redditService.loadHot(subreddits, minNumOfVotes)]);
        } else {
          subreddits = getSubReddits(channel);
          ytChannels = getYouTubeChannels(channel);
          minNumOfVotes = getChannelMinVotes(channel);
          promises = Promise.all([
            props.redditService.loadHot(subreddits, minNumOfVotes),
            ytChannels ? props.youtubeService.loadChannels(ytChannels) : [],
          ]);
        }
      } else {
        context.emit('set-channel', null);
        promises = Promise.all([props.redditService.loadHot(subreddits, minNumOfVotes)]);
      }
      getStorage();
      promises
        .then((resolvers) => {
          const [redditVideos, youtubeVideos = []] = resolvers;
          if (redditVideos.length < 1 && youtubeVideos.length < 1) {
            videoMessage.value = "Sorry, we couldn't find any videos in /" + channel;

            if (props.searchInput) {
              videoMessage.value = `Sorry, we couldn't find any videos in /r/${props.searchInput}`;
            }
            return;
          }

          videoList.value = props.mixed([redditVideos, youtubeVideos]);
          loadingVideos.value = false;

          if (pathname.split('/').length === 3 && pathname.indexOf('/r/') === -1) {
            // find video index to play
            let index = videoList.value.findIndex((v) => v.id === id);
            if (index !== -1) {
              indexToPlay.value = index;
              play(index);
              return;
            }
          }

          play(0);
        })
        .catch((error) => {
          videoMessage.value = 'Sorry, there was an error retrieving videos in /' + channel;
          if (props.searchInput) {
            videoMessage.value = `Sorry, there was an error retrieving videos /r/${props.searchInput}`;
          }
          console.log(error);
        });
    };
    // eslint-disable-next-line no-unused-vars
    const fetchVideosFromYoutube = function (query) {
      this.contentType = 'youtube';
      // eslint-disable-next-line no-undef
      this.loadingVideos = true;
      this.getStorage();
      props.youtubeService
        .search(query)
        .then((videos) => {
          if (videos.length < 1) {
            this.videoMessage = 'Sorry, we couldn\'t find any YouTube videos for "' + query + '"';
            return;
          }
          this.loadingVideos = false;
          this.videoList = videos;
          this.play(0);
        })
        .catch((error) => {
          this.videoMessage = 'Sorry, there was an error getting YouTube videos for "' + query + '"';
          // eslint-disable-next-line no-console
          console.error(error);
        });
    };
    /**
     * When the input field is being typed
     * @param {string} value
     */
    // eslint-disable-next-line no-unused-vars

    // eslint-disable-next-line no-unused-vars
    const onSubmit = function (event) {
      event.preventDefault();
    };
    // eslint-disable-next-line no-unused-vars
    const search = function (value, player) {
      // this.$emit('input', event);
      player.stopVideo();
      if (value && value.includes('YouTube')) {
        value = value.split(' (')[0];

        window.history.replaceState(null, null, '/');
        context.emit('set-channel', null);
        fetchVideosFromYoutube(value);
        return;
      }
      // eslint-disable-next-line vue/no-mutating-props
      props.searchInput = value;
      if (value) {
        value = value.split(' (')[0];
        window.history.replaceState(null, null, '/r/' + value);
        context.emit('set-channel', value);
        fetchAllVideos(value);
      } else fetchAllVideos();
    };
    // eslint-disable-next-line no-unused-vars

    // eslint-disable-next-line no-unused-vars
    const watched = function (i) {
      // eslint-disable-next-line vue/no-ref-as-operand
      if (-1 == videosWatched.value.indexOf(i)) {
        // eslint-disable-next-line vue/no-ref-as-operand
        videosWatched.value.push(i);
        setStorage();
      }
    };
    // eslint-disable-next-line no-unused-vars
    const vote = function (id, num) {
      voted.value = num;
      ga('send', 'event', 'voted', 'click');
    };
    // eslint-disable-next-line no-unused-vars
    const keys = function (evt) {
      evt = evt || window.event;
      '37' == evt.keyCode ? prevVideo() : '39' == evt.keyCode && nextVideo();
    };

    // eslint-disable-next-line no-unused-vars
    const playVideo = function (t, player) {
      if (!player || !player.loadVideoById) return;
      this.mobile ? player.cueVideoById(t.youtubeId) : player.loadVideoById(t.youtubeId);
    };

    // eslint-disable-next-line no-unused-vars
    const prevVideo = function () {
      if (videoPlaying.value < 1) return;
      videoPlaying.value--;
      play(videoPlaying.value);
      scroll(-1);
    };

    // eslint-disable-next-line no-unused-vars
    const nextVideo = function () {
      if (videoPlaying.value >= videoList.value.length - 1) {
        return;
      }
      videoPlaying.value++;
      play(videoPlaying.value);
      scroll(1);
    };

    // eslint-disable-next-line no-unused-vars
    const scroll = function (num) {
      var e = $('#toolbox').scrollTop();
      var n = $('#toolbox .active').parent().height();
      $('#toolbox').scrollTop(e + num === 1 ? n + 1 : -(n + 1));
    };
    // eslint-disable-next-line no-unused-vars
    const getStorage = function () {
      if (storageAvailable() && localStorage.getItem('videosWatched')) {
        var t = localStorage.getItem('videosWatched');
        videosWatched.value = JSON.parse(t);
      }
    };
    // eslint-disable-next-line no-unused-vars
    const setStorage = function () {
      console.log('SetStore');
      if (storageAvailable()) {
        var t = JSON.stringify(videosWatched.value);
        localStorage.setItem('videosWatched', t);
      }
    };

    // eslint-disable-next-line no-unused-vars
    const storageAvailable = function () {
      try {
        var n = '__storage_test__';
        window.localStorage.setItem(n, n);
        window.localStorage.removeItem(n);
        return true;
      } catch (_) {
        return false;
      }
    };
    // eslint-disable-next-line no-unused-vars
    const changeChannel = function (channel) {
      context.emit('set-search-input', '');
      if (props.channel !== channel) {
        youtube.value.player.stopVideo();
        context.emit('set-channel', channel);
        window.history.replaceState(null, null, '/' + channel);
        fetchAllVideos(channel);
      }
      //$('#navbar-collapse-1').collapse('hide');
    };

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) mobile.value = true;
    props.channel || context.emit('set-channel', 'general');
    fetchAllVideos();
    window.addEventListener('keyup', keys);

    onBeforeUnmount(() => {
      window.removeEventListener('keyup', keys);
    });

    return {
      autoplay,
      contentType,
      loadingVideos,
      mobile,
      playingVideo,
      videoList,
      videoMessage,
      videoPlaying,
      videosWatched,
      voted,
      youtube,
      fetchAllVideos,
      keys,
      nextVideo,
      indexToPlay,
      play,
      changeChannel,
    };
  },
};
</script>

