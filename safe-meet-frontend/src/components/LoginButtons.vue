<template>
  <div>
    <fb-signin-button
      class="loginBtn loginBtn--facebook"
      :params="fbSignInParams"
      @success="onSignInSuccess"
      @error="onSignInError">
      Continue with Facebook
    </fb-signin-button>

  </div>
</template>
<style scoped>
body { padding: 2em; }


/* Shared */
.loginBtn {
  box-sizing: border-box;
  position: relative;
  /* width: 13em;  - apply for fixed size */
  margin: 0.2em;
  padding: 0 15px 0 46px;
  border: none;
  text-align: left;
  line-height: 34px;
  white-space: nowrap;
  border-radius: 0.2em;
  font-size: 20px;
  color: #FFF;
  display: inline-block;
  cursor: pointer;
}
.loginBtn:before {
  content: "";
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  width: 34px;
  height: 100%;
}
.loginBtn:focus {
  outline: none;
}
.loginBtn:active {
  box-shadow: inset 0 0 0 32px rgba(0,0,0,0.1);
}


/* Facebook */
.loginBtn--facebook {
  background-color: #4C69BA;
  background-image: linear-gradient(#4C69BA, #3B55A0);
  /*font-family: "Helvetica neue", Helvetica Neue, Helvetica, Arial, sans-serif;*/
  text-shadow: 0 -1px 0 #354C8C;
}
.loginBtn--facebook:before {
  border-right: #364e92 1px solid;
  background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/14082/icon_facebook.png') 6px 6px no-repeat;
}
.loginBtn--facebook:hover,
.loginBtn--facebook:focus {
  background-color: #5B7BD5;
  background-image: linear-gradient(#5B7BD5, #4864B1);
}


/* Google */
.loginBtn--google {
  /*font-family: "Roboto", Roboto, arial, sans-serif;*/
  background: #DD4B39;
}
.loginBtn--google:before {
  border-right: #BB3F30 1px solid;
  background: url('https://s3-us-west-2.amazonaws.com/s.cdpn.io/14082/icon_google.png') 6px 6px no-repeat;
}
.loginBtn--google:hover,
.loginBtn--google:focus {
  background: #E74B37;
}
</style>
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
