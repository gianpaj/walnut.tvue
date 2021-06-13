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
                <a @click="changeChannel(item.title)"> {{ item.title }} </a>
              </li>              
            </ul>
          </div>
        </div>
        
        <div class="hide-mobile-portrait mobile-navbar-portrait">
          <ul class="nav navbar-nav">
            <li v-for="item in channels" :key="item.title" :class="{ 'active': item.title == channel && !searchInput }">
              <a @click="changeChannel(item.title)"> {{ item.title }} </a>
            </li>
          </ul>
          <!--<form class="hide-mobile-portrait navbar-form" @submit="onSubmit($event)"><div class="form-group">
                  <span class="glyphicon glyphicon-search form-control-feedback"></span>
                  <v-select
                    placeholder="search"
                    label="title"
                    @search="onSearch"
                    @input="onChange"
                    :options="options"
                    v-model:value="searchInput"
                  >
                    <template slot="option" slot-scope="option">
                      <span class="fa-youtube"></span>
                      {{ option }}
                    </template>
                    <template slot="no-options">
                      <slot name="no-options"></slot>
                    </template>
                  </v-select>
                </div>
          </form>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import '../assets/all.css'
//import $ from 'jquery'
//import {onMounted} from 'vue'

export default {
    name: 'NavBar',
    props: ['search-input', 'options', 'channel', 'channels'],
    emits: ['change', 'change-channel'],
    setup(props, context) {
      
      const onSearch = function(value) {
        // eslint-disable-next-line vue/no-mutating-props
        props.searchInput = '';
        // eslint-disable-next-line vue/no-mutating-props
        props.options = [value + ' (YouTube)', value + ' (Subreddit)'];
      }

      // eslint-disable-next-line no-unused-vars
      const onChange = function(value) {
        // eslint-disable-next-line no-undef
        console.log('chagement');
        //emit('change', value);
      }

      const changeChannel = function(v) {
        //$('#navbar-collapse-1').collapse('hide');
        context.emit('change-channel', v);
      }

      return {onSearch, onChange, changeChannel}        
    }
}
</script>
  
          