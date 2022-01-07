<template>
  <reception />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import Reception from "../components/Reception.vue"

@Component({
  name: "ReceptionView",
  components: {
    reception: Reception,
  },
})
export default class ReceptionView extends Vue {}
</script>
