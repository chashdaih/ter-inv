<template>
  <div id="app" :style="[!currentUser ? {'background-color': '#17365D', 'height': '100vh'}: {}]">
    <nav-bar></nav-bar>
    <section class="section">
        <div class="container grid">
          <router-view/>
        </div>
    </section>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import NavBar from './components/NavBar'

export default {
  components: { NavBar },
  computed: {
    ...mapState(['currentUser'])
  },
  
}
</script>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: [xl-start] 1fr 1.5rem [md-start] minmax(0, 960px) [md-end] 1.5rem 1fr [xl-end];
  }

  .grid * {
    grid-column: md;
  }

@import "~bulma/sass/utilities/_all";
$unam: #17365D;
$unam-invert: findColorInvert($unam);
$colors: (
  "white": ($white, $black),
  "black": ($black, $white),
  "light": ($light, $light-invert),
  "dark": ($dark, $dark-invert),
  "primary": ($primary, $primary-invert),
  "info": ($info, $info-invert),
  "link": ($link, $link-invert),
  "success": ($success, $success-invert),
  "warning": ($warning, $warning-invert),
  "danger": ($danger, $danger-invert),
  "unam": ($unam, $unam-invert)
);
@import "~bulma";
@import "~buefy/src/scss/buefy";
</style>