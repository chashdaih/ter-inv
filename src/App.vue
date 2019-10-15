<template>
  <div id="app" :style="[!currentUser ? {'background-color': '#17365D', 'height': '100vh'}: {}]">
    <nav-bar v-if="currentUser" ></nav-bar>
    <section class="section">
      <!-- <div class="columns">
        <div class="column is-one-fifth">
          <side-menu v-if="currentUser"></side-menu>
        </div>
        <div class="column"> -->
          <div class="container grid">
            <router-view/>
          </div>
        <!-- </div>
        <div class="column is-one-fifth"></div>
      </div> -->
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NavBar from './components/NavBar'
import SideMenu from './components/SideMenu'

export default {
  components: { NavBar, SideMenu },
  computed: {
    ...mapState(['currentUser'])
  }
}
</script>

<style>
  .grid {
    display: grid;
    grid-template-columns: [xl-start] 1fr 1.5rem [md-start] minmax(0, 960px) [md-end] 1.5rem 1fr [xl-end];
  }

  .grid * {
    grid-column: md;
  }
  /* .grid-xl {
    grid-column: xl;
  } */
</style>