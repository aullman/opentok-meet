<template>
  <div class="main" v-if="!loggedIn || !phoneVerified">
    <img class="background" src="../assets/background.jpg" />
    <div class="welcome">
      <h1>Safe spaces</h1>
      <div v-if="!loggedIn">
        <p>
          Meet, socialise, and hangout (but keep it in your pants) with others in the worlds safest and funnest video service.
        </p>

        <p>
          We value your safety online, and have eployed the most sophisticated deep-learning artificially intelligent algorithms that exist into protecting you and your loved one's innocence.
        </p>
        <login-buttons @signin="signin"></login-buttons>
      </div>
      <div v-else>
        <p>We need to verify your mobile number before you can use this service.</p>

        <div v-if="!userCreated">
          <form>
            <vue-tel-input ref="phone" v-model="phone" :preferredCountries="['us', 'au']">
            </vue-tel-input>
            <br />
            <button type="submit" @click.stop.prevent="create">Continue</button>
          </form>
        </div>
        <div v-else>
          <p v-if="invalidCode" class="invalid">
            That code was invalid. Please try again.
          </p>
          <p>
            Enter the code sent to {{ user.phone }}. <a style="font-size: 18px;" href="#" @click.prevent.stop="resend">Resend</a>
          </p>
          <input ref="code" @keyup.enter="verify" v-model="code" type="text" />
          <button @click="verify">Verify</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <slot />
  </div>

</template>

<style lang="stylus" scoped>
  p.invalid {
    color: #F44336 !important;
  }
  button {
      box-sizing: border-box;
      margin: 0.2em;
      padding: 5px 30px;
      border: none;
      text-align: left;
      line-height: 34px;
      white-space: nowrap;
      border-radius: 0.2em;
      font-size: 20px;
      color: #FFF;
      display: inline-block;
      cursor: pointer;
      background: #2196F3;
      text-shadow: 1px 1px 1px #000;
      font-size: 26px;
      padding: 0.5em 1em;

      &:focus {
        outline: none;
      }
      &:active {
        box-shadow: inset 0 0 0 32px rgba(0,0,0,0.1);
      }
  }
  .main {
    display: flex;
    justify-content: center;
    position: absolute;
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
  a {
    color: #ccc;
  }
  a:hover {
    color: white;
  }
  .welcome {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 50%;

    p {
      color: #ccc;
      font-size: 24px;
      text-shadow: 0px 0px 10px #000;
    }

    align-self: center;
    z-index: 1;
    padding: 3em;
    text-align: center;
    border-radius: 1em;

    h1 {
      margin-top: 1rem;
      margin-bottom: 0;
      font-size: 64px;
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
  import LoginButtons from "@/components/LoginButtons.vue";
  import axios from "axios";
  import Vue from 'vue';

  export default {
    data() {
      return {
        code: "",
        user: {},
        invalidCode: false,
        phoneVerified: false,
        userCreated: false,
        phone: "",
        loggedIn: localStorage.getItem("safeSpacesUser")
      };
    },
    async mounted() {
      this.populateUser();
    },
    methods: {
      async populateUser() {
        try {
          const user = JSON.parse(localStorage.getItem("safeSpacesUser"));
          try {
            const { data: remoteUser } = await axios.get(`/v1/user/${user.id}`);
            console.log(remoteUser);
            this.user = remoteUser;
            this.userCreated = true;
            this.phoneVerified = remoteUser.phoneVerified;

            if (!this.userCreated) {
              Vue.nextTick(() => {
                this.$refs.phone.$refs.input.focus();
              });
            }
            if (!this.phoneVerified) {
              debugger;
              Vue.nextTick(() => {
                debugger;
                this.$refs.code.focus();
              });
            }
          } catch (err) {
            Vue.nextTick(() => {
              this.$refs.phone.$refs.input.focus();
            });
            // ignore these for now
          }
        } catch (err) {
          // ignore these...
        }
      },
      async resend() {
        const user = JSON.parse(localStorage.getItem("safeSpacesUser"));

        axios.post(`/v1/user/${user.id}/code`);
      },
      async verify() {
        const user = JSON.parse(localStorage.getItem("safeSpacesUser"));
        try {
          await axios.post(`/v1/user/${user.id}/code/verify`, {
            code: this.code
          });
          this.phoneVerified = true;
        } catch (err) {
          this.invalidCode = true;
        }
      },
      async create() {
        const user = JSON.parse(localStorage.getItem("safeSpacesUser"));
        user.phone = this.phone;

        try {
          await axios.post("/v1/user", user);
        } catch (err) {
          if (err.response.status !== 409) {
            throw err;
          }
          this.userCreated = true;
          return;
        }
        this.userCreated = true;
        this.populateUser();
        this.resend();
      },
      signin() {
        this.loggedIn = true;
        this.populateUser();
      }
    },
    components: {
      LoginButtons
    }
  };
</script>
