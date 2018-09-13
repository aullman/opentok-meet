<template>
  <div class="main">
    <img class="background" src="../assets/background.jpg" />
    <div class="welcome">
      <h1>Safe spaces</h1>

      <control-login>
        <h1>Success</h1>
      </control-login>

    </div>
  </div>
</template>

<style lang="stylus" scoped>
  .main {
    display: flex;
    justify-content: center;
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;
    left: 0px;
  }
  body {
    padding: 0;
    margin: 0;
  }
  img.background {
    position: fixed;
    top: -15px;
    left: -15px;
    height: calc(100vh + 30px);
    width: calc(100vw + 30px);
    object-fit: cover;
    filter: blur(10px) contrast(100%) sepia(80%) brightness(50%);
    z-index: -1;
  }
  .welcome {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 60%;
    p {
      text-shadow: 0px 0px 10px #000;
      font-size: 36px;
    }
    align-self: center;
    z-index: 1;
    padding: 3em;
    text-align: center;
    border-radius: 1em;
    color: white;
    font-family: Arial, Helvetica, sans-serif;
    color: #ddd;

    h1 {
      margin-top: 1rem;
      font-size: 100px;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: normal;
      color: white;
      text-shadow: 0px 0px 10px #000;
    }

    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 2px 2px rgba(0, 0, 0, 0.1);
  }
</style>

<script>

import ControlLogin from '@/components/ControlLogin.vue';

export default {
  name: "home",
  components: {
    ControlLogin
  }
};
</script>
