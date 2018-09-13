<template>
  <iframe frameBorder="0" :src="`/v1/${room}`"></iframe>
</template>

<style lang="stylus">
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0;
    width: 100vw;
    height: 100vh;
  }
</style>

<script>
  export default {
    computed: {
      room() {
        return this.$route.params.name;
      }
    }
  }
</script>
