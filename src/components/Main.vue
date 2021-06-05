<template>
  <div class="main-content">
              <div id="video-container" class="video-container pre-scrollable">
                <EmbedContainer :video-list="videoList" :autoplay="autoplay" :index="indexToPlay"/>
                
                <div class="video-details">
                  <a href="{{ playingVideo['permalink'] }}" target="_blank">
                    <h2 v-cloak>{!! playingVideo['title'] !!}</h2>
                  </a>
                  <img
                    alt="share"
                    title="share"
                    class="share-icon pull-left"
                    src="../assets/share.svg"
                    v-on:click="share(playingVideo)"
                  />
                </div>
                <div class="terms-container">
                  <a class="terms" target="_black" href="https://www.youtube.com/t/terms">YouTube ToS</a> &nbsp;
                  <a class="terms" target="_black" href="https://policies.google.com/privacy">Google Privacy Policy</a>
                </div>
                <div class="video-controls hide-desktop">
                  <svg
                    alt="previous"
                    title="previous"
                    class="prev-video pull-left"
                    v-on:click="prevVideo()"
                    viewBox="0 0 292.362 292.362"
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
                    v-on:click="nextVideo()"
                    viewBox="0 0 292.362 292.362"
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
</template>

<script>
import {ref} from 'vue'
import $ from 'jquery'
import ga from 'vue-ga'
import EmbedContainer from './EmbedContainer.vue'

export default {
    name: 'Main',
    components: {EmbedContainer},
    props: ['youtube-service', 'reddit-service', 'mixed'],
    created() {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) this.mobile = true;
      this.channel || (this.channel = 'general');
      this.fetchAllVideos();
      window.addEventListener('keyup', this.keys);
    },
    setup(props) {
      var paths = window.location.pathname.split('/').filter(a => a);
      var loadingVideosMessage = 'Loading Videos <img src="/img/spin.svg" class="loading" alt="Loading Videos">';
      //data

      const autoplay = ref(true)
      const channel = ref(paths.length === 1 && paths[0])
      const channels = ref(channels)
      const contentType = ref('') // 'youtube' or 'reddit'
      const loadingVideos = ref(true)
      const mobile = ref(false)
      const options = ref([])
      const playingVideo = ref([])
      const searchInput = ref(null)
      const videoList = ref([])
      const videoMessage = ref(loadingVideosMessage)
      const videoPlaying = ref(0)
      const videosWatched = ref([])
      const voted = ref(0)
      const player = this.$refs.youtube.player
      // eslint-disable-next-line no-unused-vars
      let indexToPlay = 0;

      //methods
      // eslint-disable-next-line no-unused-vars
      const getSubReddits = channel => channels.value.find(c => c.title == channel.value).subreddit
      // eslint-disable-next-line no-unused-vars
      const getYouTubeChannels = channel => channels.value.find(c => c.title == channel.value).youtubeChannels
      // eslint-disable-next-line no-unused-vars
      const getChannelMinVotes =  channel => channels.value.find(c => c.title == channel.value).minNumOfVotes
      // eslint-disable-next-line no-unused-vars
      const fetchAllVideos = function(searchText) {
        let id, minNumOfVotes, ytChannels, promises;
        let subreddits = searchText;
        const { pathname } = window.location;
        this.contentType = 'reddit';
        this.loadingVideos = true;
        this.videoMessage = loadingVideosMessage;
        // if changing channel - changeChannel()
        if (!searchText) {
          if (pathname.split('/').length === 3) {
            id = pathname.split('/')[pathname.split('/').length - 1];
          }

          if (pathname.split('/r/').length > 1) {
            subreddits = this.channel;
            promises = Promise.all([props.redditService.loadHot(subreddits, minNumOfVotes)]);
          } else {
            subreddits = this.getSubReddits(this.channel);
            ytChannels = this.getYouTubeChannels(this.channel);
            minNumOfVotes = this.getChannelMinVotes(this.channel);
            promises = Promise.all([
              props.redditService.loadHot(subreddits, minNumOfVotes),
              ytChannels ? props.youtubeService.loadChannels(ytChannels) : [],
            ]);
          }
        } else {
          this.channel = null;
          promises = Promise.all([props.redditService.loadHot(subreddits, minNumOfVotes)]);
        }
        this.getStorage();
        promises
          .then(resolvers => {
            const [redditVideos, youtubeVideos = []] = resolvers;
            if (window.location.search == '?debug') {
              // eslint-disable-next-line no-console
              console.log(
                redditVideos.map(v => ({
                  subreddit: v.permalink.split('/r/')[1].split('/')[0],
                  title: v.title,
                  link: v.permalink,
                  youtubeId: v.youtubeId,
                }))
              );
              // eslint-disable-next-line no-console
              console.log(
                youtubeVideos.map(v => ({
                  title: v.title,
                  link: v.permalink,
                  youtubeId: v.youtubeId,
                  publishedAt: v.publishedAt,
                }))
              );
            }
            if (redditVideos.length < 1 && youtubeVideos.length < 1) {
              this.videoMessage = "Sorry, we couldn't find any videos in /" + this.channel;

              if (this.searchInput) {
                this.videoMessage = `Sorry, we couldn't find any videos in /r/${this.searchInput}`;
              }
              return;
            }
            this.videoList = props.mixElementsFromArraysOfArrays([redditVideos, youtubeVideos]);
            // if (searchText) window.history.replaceState(null, null, '/r/' + searchText);
            this.loadingVideos = false;

            // this.playingVideo = redditVideos;
            if (pathname.split('/').length === 3 && pathname.indexOf('/r/') === -1) {
              // find video index to play
              let index = this.videoList.findIndex(v => v.id === id);
              if (index !== -1) {
                indexToPlay = index;
                this.play(index);
                return;
              }
            }
            // this.watched(this.videoList[0].youtubeId);
            this.play(0);
          })
          .catch(error => {
            this.videoMessage = 'Sorry, there was an error retrieving videos in /' + this.channel;
            if (this.searchInput) {
              this.videoMessage = `Sorry, there was an error retrieving videos /r/${this.searchInput}`;
            }
            // eslint-disable-next-line no-console
            console.error(error);
          });
      }
      // eslint-disable-next-line no-unused-vars
      const fetchVideosFromYoutube = function(query) {
        this.contentType = 'youtube';
        // eslint-disable-next-line no-undef
        this.loadingVideos = true;
        this.getStorage();
        props.youtubeService
          .search(query)
          .then(videos => {
            if (videos.length < 1) {
              this.videoMessage = 'Sorry, we couldn\'t find any YouTube videos for "' + query + '"';
              return;
            }
            this.loadingVideos = false;
            this.videoList = videos;
            this.play(0);
          })
          .catch(error => {
            this.videoMessage = 'Sorry, there was an error getting YouTube videos for "' + query + '"';
            // eslint-disable-next-line no-console
            console.error(error);
          });
      }
      /**
      * When the input field is being typed
      * @param {string} value
      */
     // eslint-disable-next-line no-unused-vars
      const onSearch = function(value) {
        this.searchInput = '';
        this.options = [value + ' (YouTube)', value + ' (Subreddit)'];
      }
      // eslint-disable-next-line no-unused-vars
      const onChange = function(value) {
        if (value) this.search(value);
      }
      // eslint-disable-next-line no-unused-vars
      const onSubmit = function(event) {
        event.preventDefault();
      }
      // eslint-disable-next-line no-unused-vars
      const search = function(value) {
        // this.$emit('input', event);
        player.stopVideo();
        if (value && value.includes('YouTube')) {
          value = value.split(' (')[0];

          window.history.replaceState(null, null, '/');
          this.channel = null;
          this.fetchVideosFromYoutube(value);
          return;
        }
        this.searchInput = value;
        if (value) {
          value = value.split(' (')[0];
          window.history.replaceState(null, null, '/r/' + value);
          this.channel = value;
          this.fetchAllVideos(value);
        } else this.fetchAllVideos();
      }
      // eslint-disable-next-line no-unused-vars
      const hasBeenWatched = function(youtubeId) {
        return -1 != this.videosWatched.indexOf(youtubeId) && youtubeId != this.videoList[this.videoPlaying].youtubeId;
      }
      // eslint-disable-next-line no-unused-vars
      const watched = function(i) {
        if (-1 == this.videosWatched.indexOf(i)) {
          this.videosWatched.push(i);
          this.setStorage();
        }
      }
      // eslint-disable-next-line no-unused-vars
      const vote = function(id, num) {
        this.voted = num;
        ga('send', 'event', 'voted', 'click');
      }
      // eslint-disable-next-line no-unused-vars
      const keys = function(evt) {
        evt = evt || window.event;
        '37' == evt.keyCode ? this.prevVideo() : '39' == evt.keyCode && this.nextVideo();
      }
      // eslint-disable-next-line no-unused-vars
      const playVideo = function(t) {
        if (!player || !player.loadVideoById) return;
        this.mobile ? player.cueVideoById(t.youtubeId) : player.loadVideoById(t.youtubeId);
      }
      
      // eslint-disable-next-line no-unused-vars
      const prevVideo = function() {
        if (this.videoPlaying < 1) return;
        this.videoPlaying--;
        this.play(this.videoPlaying);
        this.scroll(-1);
      }
      // eslint-disable-next-line no-unused-vars
      const scroll = function(num) {
        var e = $('#toolbox').scrollTop();
        var n = $('#toolbox .active')
          .parent()
          .height();
        $('#toolbox').scrollTop(e + num === 1 ? n + 1 : -(n + 1));
      }
      // eslint-disable-next-line no-unused-vars
      const getStorage = function() {
        if (this.storageAvailable() && localStorage.getItem('videosWatched')) {
          var t = localStorage.getItem('videosWatched');
          this.videosWatched = JSON.parse(t);
        }
      }
      // eslint-disable-next-line no-unused-vars
      const setStorage = function() {
        if (this.storageAvailable()) {
          var t = JSON.stringify(this.videosWatched);
          localStorage.setItem('videosWatched', t);
        }
      }
      // eslint-disable-next-line no-unused-vars
      const share = function(video) {
        var url;
        if (this.channel && this.playingVideo.permalink.includes('reddit.com')) {
          url = `https://walnut.tv/${this.channel}/${video.id}`;
        } else {
          // YouTube
          url = this.playingVideo.permalink;
        }
        $('#shareModal').modal('show');
        // put text into #url-text
        $('#url-text')[0].value = url;
      }
      // eslint-disable-next-line no-unused-vars
      const storageAvailable = function() {
        try {
          var n = '__storage_test__';
          window.localStorage.setItem(n, n);
          window.localStorage.removeItem(n);
          return true;
        } catch (_) {
          return false;
        }
      }
      // eslint-disable-next-line no-unused-vars
      const changeChannel = function(channel) {
        this.searchInput = '';
        if (this.channel !== channel) {
          player.stopVideo();
          this.channel = channel;
          window.history.replaceState(null, null, '/' + channel);
          this.fetchAllVideos();
        }
        $('#navbar-collapse-1').collapse('hide');
      }  

      return {autoplay, channel, channels, contentType, loadingVideos, mobile, options, playingVideo, 
                searchInput, videoList, videoMessage, videoPlaying, videosWatched, voted}
    },
    beforeUnmount() {
      window.removeEventListener('keyup', this.keys);
    }

}
</script>

