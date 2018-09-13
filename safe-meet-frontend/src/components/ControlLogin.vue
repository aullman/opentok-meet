<template>
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
    <vue-tel-input v-model="phone" :preferredCountries="['us', 'au']"></vue-tel-input>
    <button @click="verify">Verify</button>
  </div>
</template>

<script>
  import LoginButtons from '@/components/LoginButtons.vue';
  import axios from 'axios';

  export default {
    data() {
      return {
        phone: "",
        loggedIn: localStorage.getItem("safeSpacesUser")
      };
    },
    methods: {
      async verify() {
        const user = JSON.parse(localStorage.getItem("safeSpacesUser"));
        user.phone = this.phone;

        await axios.post('/v1/user', user);

      },
    },
    components: {
      LoginButtons,
    }
  };
</script>
