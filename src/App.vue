<template>
  <NavBar :channel="channel" :channels="channels" @change-channel="changeChannel" @change="onChange" />
  <Main
    ref="main"
    :channel="channel"
    :channels="channels"
    :search-input="searchInput"
    :reddit-service="redditService"
    :youtube-service="youtubeService"
    :mixed="mixElementsFromArraysOfArrays"
    @set-search-input="setSearchInput"
    @set-channel="setChannel"
  />
  <!--<router-view/>-->
</template>

<script>
import { ref } from 'vue';
import searchYoutube from 'youtube-api-v3-search';

import './assets/all.css';
import Main from './components/Main.vue';
import NavBar from './components/NavBar.vue';

export default {
  name: 'App',
  components: { NavBar, Main },
  setup() {
    const youtubeApiKey = 'AIzaSyD342vuWxFeyEMKANx58qKyECeNsxlv0f8';
    const youtubeURL = 'http://www.youtube.com/watch?v=';
    const youtubeURLLength = youtubeURL.length;
    const embedLength = '/embed/'.length;
    const searchInput = ref('');
    const main = ref(null);
    const channels = ref([
      {
        title: 'general',
        subreddit: 'videos',
        minNumOfVotes: 100,
        // youtubeChannels: 'UCsvn_Po0SmunchJYOWpOxMg;UCzQUP1qoWDoEbmsQxvdjxgQ',
      },
      {
        title: 'curious',
        subreddit: 'curiousvideos;mealtimevideos;educativevideos;watchandlearn',
        minNumOfVotes: 3,
        youtubeChannels:
          'UCzQUP1qoWDoEbmsQxvdjxgQ;UCDsElQQt_gCZ9LgnW-7v-cQ;UCX6b17PVsYBQ0ip5gyeme-Q;UCmmPgObSUPw1HL2lq6H4ffA;UC7IcJI8PUf5Z3zKxnZvTBog;UCZYTClx2T1of7BRZ86-8fow;UC9uD-W5zQHQuAVT2GdcLCvg',
      },
      {
        title: 'science',
        subreddit: 'biology;psychology;lectures;space;philosophy;physics;math',
        minNumOfVotes: 3,
      },
      {
        title: 'documentaries',
        subreddit: 'documentaries',
        minNumOfVotes: 10,
      },
    ]);

    // eslint-disable-next-line no-unused-vars
    var paths = window.location.pathname.split('/').filter((a) => a);
    //const channel = ref(paths.length === 1 && paths[0])
    const channel = ref('general');
    function RedditVideoService() {
      function isVideoObject(obj) {
        var data = obj.data;
        // reddit videos
        if (data.is_video === true) return true;

        // debug only - return only reddit videos
        // return false;

        if (data.media !== null) {
          return data.media.type.includes('youtube.com') || data.media.type.includes('vimeo.com');
        }
        return false;
      }

      function filterByUpvotes(video, upsMin) {
        return video.data.ups >= upsMin;
      }

      function childObjectToDomainVideoModel(video) {
        const data = video.data;
        const result = {};
        result.title = data.title;
        result.id = data.id;
        result.permalink = 'https://www.reddit.com/' + data.permalink;
        result.created_utc = data.created_utc;
        result.ups = data.ups;
        result.voted = 0;

        // reddit video
        if (data.is_video) {
          result.videoUrl = data.media.reddit_video.fallback_url;
          result.type = 'reddit';
          return result;
        }

        // youtube video
        if (data.media.type === 'youtube.com') {
          const { oembed } = data.media;
          result.type = 'youtube';

          if (oembed.url && oembed.url.indexOf(youtubeURL) === 0) {
            return (result.videoUrl = oembed.html.substring(youtubeURLLength));
          }
          const { html } = oembed;
          const startIndex = html.indexOf('/embed/') + embedLength;
          const endIndex = html.indexOf('?');
          result.videoUrl = html.substring(startIndex, endIndex);
          result.youtubeId = html.substring(startIndex, endIndex);
        }

        // vimeo video
        if (data.media.type === 'vimeo.com') {
          result.videoUrl = 'vimeo.com';
          result.type = 'vimeo';
        }

        return result;
      }

      // eslint-disable-next-line no-unused-vars
      function dynamicSort(property) {
        let sortOrder = 1;
        if (property[0] === '-') {
          sortOrder = -1;
          property = property.substr(1);
        }
        return function (a, b) {
          const result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
          return result * sortOrder;
        };
      }

      function _loadHot(channel, upsMin, after) {
        return new Promise((result, reject) => {
          if (typeof channel !== 'string') {
            return reject(new Error('Bad channel argument value. Channel should be a string'));
          }
          // eslint-disable-next-line no-undef
          let query = reddit.hot(channel).limit(50);
          if (after) query = query.after(after);

          query.fetch(
            (res) => {
              if (res.error) return reject(res);
              let videos = res.data.children.filter(isVideoObject);

              if (upsMin) {
                videos = videos.filter((vid) => filterByUpvotes(vid, upsMin));
              }

              videos = videos.map(childObjectToDomainVideoModel).filter((v) => v.type === 'youtube');

              result(videos);
            },
            // err contains the error from Reddit
            (err) => reject(err)
          );
        });
      }

      /**
       * Get videos from subreddit(s)
       *
       * @param {string} channel_s one or more channels - e.g. 'funny' or' 'funny;cool'
       * @param {number} upsMin minimum amount of up votes per video
       * TODO: @ param {*} after reddit id to load more videos for multiple channels
       */
      async function loadHot(channel_s, upsMin) {
        const channel_arr = channel_s.split(';');
        // console.warn("fetching", channel_s.length, "channels");
        const promises = channel_arr.map((channel) => _loadHot(channel, upsMin));

        const arrayOfArrayOfVideos = await Promise.all(promises);

        let videos = mixElementsFromArraysOfArrays(arrayOfArrayOfVideos);

        const uniq = {};
        // remove duplicate videos
        videos = videos.filter((arr) => !uniq[arr.videoUrl] && (uniq[arr.videoUrl] = true));

        return [].concat.apply([], videos);
        // .sort(dynamicSort("created_utc"));
      }

      // public interface
      return {
        loadHot,
      };
    }

    const mixElementsFromArraysOfArrays = function (arrayOfArrays) {
      // find the smallest amount of videos for every channel
      const leastAmountOfVids = Math.min.apply(
        null,
        arrayOfArrays.map((arr) => arr.length).filter((arr) => arr)
      );

      if (arrayOfArrays.length === 1) {
        return arrayOfArrays;
      }

      if (arrayOfArrays.filter((arr) => arr.length > 0).length === 0) {
        return [];
      }

      arrayOfArrays = arrayOfArrays.filter((a) => a.length);
      let videos = [];
      // get one video of each channel in rotation
      for (let i = 0; i < leastAmountOfVids; i++) {
        for (let j = 0; j < arrayOfArrays.length; j++) {
          const vid = arrayOfArrays[j][i];
          videos.push(vid);
        }
      }
      // get the rest of videos
      for (let k = 0; k < arrayOfArrays.length; k++) {
        const vid = arrayOfArrays[k].slice(leastAmountOfVids);
        videos.push(...vid);
      }

      return videos;
    };

    // eslint-disable-next-line no-unused-vars
    const redditService = ref(RedditVideoService());

    function YouTubeService() {
      function search(query) {
        // from youtube-api-v3-search npm
        // eslint-disable-next-line no-undef
        return searchYoutube(youtubeApiKey, {
          part: 'snippet',
          type: 'video',
          maxResults: '25',
          // videoEmbeddable: 'true',
          q: query,
        }).then(formatResults);
      }
      async function loadChannels(channel_s) {
        channel_s = channel_s.split(';');
        const searches = channel_s.map((channel) => getYouTubeChannelSearch(channel));
        const arrayOfArrayOfVideos = await Promise.all(searches);

        const videos = mixElementsFromArraysOfArrays(arrayOfArrayOfVideos);
        return [].concat.apply([], videos);
      }
      function getYouTubeChannelSearch(channel) {
        // from youtube-api-v3-search npm
        // eslint-disable-next-line no-undef
        return searchYoutube(youtubeApiKey, {
          part: 'snippet',
          type: 'video',
          maxResults: '25',
          publishedAfter: new Date(new Date() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours back => yesterday
          channelId: channel,
          order: 'date',
        }).then(formatResults);
      }
      function formatResults(results) {
        if (!results.items) return null;
        return results.items.map((res) => ({
          id: res.id.videoId, // reddit id
          permalink: 'https://www.youtube.com/watch?v=' + res.id.videoId,
          title: res.snippet.title,
          channelTitle: res.snippet.channelTitle,
          description: res.snippet.description,
          youtubeId: res.id.videoId,
          publishedAt: res.snippet.publishedAt,
        }));
      }
      return {
        search,
        loadChannels,
      };
    }

    // eslint-disable-next-line no-unused-vars
    const youtubeService = ref(YouTubeService());

    const onChange = function (value) {
      if (value) main.value.search(value);
    };

    const setChannel = function (v) {
      channel.value = v;
    };

    const setSearchInput = function (v) {
      searchInput.value = v;
    };

    // eslint-disable-next-line no-unused-vars
    const changeChannel = function (v) {
      main.value.changeChannel(v);
    };

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    return {
      changeChannel,
      main,
      setSearchInput,
      setChannel,
      redditService,
      youtubeService,
      mixElementsFromArraysOfArrays,
      searchInput,
      onChange,
      channel,
      channels,
    };

    /*
    Vue.config.unsafeDelimiters = ['{!!', '!!}'];
    Vue.config.debug = false;
    Vue.component('v-select', VueSelect.VueSelect);
    Vue.filter('maxChar', function(t) {
      var e = t;
      return (
        void 0 != e &&
          e.length > 90 &&
          (e =
            jQuery
              .trim(e)
              .substring(0, 80)
              .split(' ')
              .slice(0, -1)
              .join(' ') + '...'),
        e
      );
    });
    Vue.filter('toUrl', function(t) {
      return 'https://img.youtube.com/vi/' + t + '/mqdefault.jpg';
    });
    Vue.filter('shortNumber', function(n) {
      return shortNumber(n);
    });

    */
  },
};
</script>

