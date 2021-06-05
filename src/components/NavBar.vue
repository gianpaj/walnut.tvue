<template>

<div class="navbar navbar-inverse">
        <div class="header-container">
          <div class="navbar-header">
            <a class="navbar-brand" href="/">
              <img src="../assets/walnut-logo.svg" class="walnut-logo" alt="Walnut.tv Logo"/>
            </a>
            <div class="hide-mobile-landscape hide-desktop collapse-container">
              <button
                aria-expanded="false"
                class="hide-mobile-landscape navbar-toggle collapsed"
                data-toggle="collapse"
                data-target="#navbar-collapse-1"
                type="button"
              >
                <span class="sr-only">Toggle navigation</span>
                <span>{{ channel }}</span>
              </button>
              <div class="collapse navbar-collapse" id="navbar-collapse-1">
                <ul class="nav navbar-nav">
                  <li v-for="item in channels" :key="item.id" :class="{ 'active': item.title == channel && !searchInput }">
                    <a v-on:click="changeChannel(item.title)"> {{ item.title }} </a>
                  </li>
                  
                </ul>
              </div>
            </div>
            <div class="hide-mobile-portrait mobile-navbar-portrait">
              <ul class="nav navbar-nav">
                <li v-for="item in channels" :key="item.title" :class="{ 'active': item.title == channel && !searchInput }">
                  <a v-on:click="changeChannel(item.title)"> {{ item.title }} </a>
                </li>
              </ul>
              <form class="hide-mobile-portrait navbar-form" v-on:submit="onSubmit($event)">
                <div class="form-group">
                  <span class="glyphicon glyphicon-search form-control-feedback"></span>
                  <v-select
                    placeholder="search"
                    label="title"
                    :on-search="onSearch"
                    :on-change="onChange"
                    :options="options"
                    v-model:value="searchInput"
                  >
                    <template v-slot:option>
                      <span class="fa-youtube"></span>
                      {{ option }}
                    </template>
                    <template v-slot:no-options>
                      <slot name="no-options"></slot>
                    </template>
                  </v-select>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
</template>

<script>
import '../assets/all.css'
import {ref} from 'vue'

export default {
    name: 'NavBar',
    setup() {
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
      ])

      const channel = ref('General')

      return {channels, channel}        
    }
}
</script>
  
          