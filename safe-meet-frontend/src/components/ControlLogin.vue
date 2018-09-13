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
          <vue-tel-input v-model="phone" :preferredCountries="['us', 'au']">
          </vue-tel-input>
          <button @click="create">Verify</button>
        </div>
        <div v-else>
          <div v-if="invalidCode">
            That code was invalid. Please try again.
          </div>
          Enter the code sent to: {{ user.phone }}
          <input v-model="code" type="text" />
          <button @click="verify">Verify</button>
          <a href="#" @click.prevent.stop="resend">Resend</a>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <slot />
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
  import LoginButtons from "@/components/LoginButtons.vue";
  import axios from "axios";

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
          } catch (err) {
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
