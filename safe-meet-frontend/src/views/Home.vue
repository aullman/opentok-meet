<template>
  <control-login>
    <iframe frameBorder="0" :src="`/v1/`"></iframe>
  </control-login>

  <!--

    </div>
  </div> -->
</template>



<script>

import ControlLogin from '@/components/ControlLogin.vue';

export default {
  name: "home",
  components: {
    ControlLogin
  }
};
</script>
