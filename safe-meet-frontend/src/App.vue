<template>
  <router-view/>
</template>

<style lang="stylus">
  .text-page {
    &.main {
      width: 100%;
      top: 0px;
      right: 0px;
      bottom: 0px;
      left: 0px;
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
      a {
        color: white;
      }
      margin: 0 auto;
      width: 60%;
      z-index: 1;
      padding: 3em;
      border-radius: 1em;
      color: white;
      font-size: 15px;
      font-family: Arial, Helvetica, sans-serif;
      color: #bbb;

      table {
        border-radious: 1em;
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 2px 2px rgba(0, 0, 0, 0.1);
        border-spacing: 0;
        width: 100%;
        margin-bottom: 1em;

        th {
          background: rgba(255, 255, 255, 0.1);
          text-align: left;
        }

        td, th {
          padding: 1em;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      }

      h1 {
        margin-top: 1rem;
        font-size: 100px;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: normal;
        color: white;
        text-shadow: 0px 0px 10px #000;
      }

      background: rgba(0, 0, 0, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 2px 2px rgba(0, 0, 0, 0.1);
    }
  }
</style>
