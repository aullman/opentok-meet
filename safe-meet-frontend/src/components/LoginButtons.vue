<template>
  <div>
    <fb-signin-button
      :params="fbSignInParams"
      @success="onSignInSuccess"
      @error="onSignInError">
      Sign in with Facebook
    </fb-signin-button>

  </div>
</template>

<script>
  import FBSignInButton from 'vue-facebook-signin-button';
  import Vue from 'vue';
  import axios from 'axios';

  Vue.use(FBSignInButton);

  export default {
    mounted() {
      // if (!localStorage.getItem('safeSpacesUserId')) {
      //   FB.getLoginStatus(async ({ status, authResponse: { accessToken, userID }}) => {
      //     if (status !== 'connected') {
      //       return;
      //     }
      //     FB.api('/me', (user) => {
      //       debugger;
      //       axios.post('/v1/user', {
      //         id: user.id,
      //         name: user.name,
      //         profilePic: `http://graph.facebook.com/${user.id}/picture?type=square`,

      //       });
      //     });

      //   });
      // } else {
      //   this.$emit('signedIn');
      // }
    },
    data() {
      return {
        fbSignInParams: {},
      };
    },
    methods: {
      onSignInSuccess(response) {
        // eslint-disable-next-line no-undef
        FB.api('/me', (user) => {
          user.profilePic = `http://graph.facebook.com/${user.id}/picture?type=square`;
          localStorage.setItem('safeSpacesUser', JSON.stringify(user));
          this.$emit('signin', user);
        });
      },
      onSignInError() {
        // hehehe
      },
    }
  }
</script>
