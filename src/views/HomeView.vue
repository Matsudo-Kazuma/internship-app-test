<template>
  <home />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import Home from "../components/Home.vue"

@Component({
  name: "HomeView",
  components: {
    home: Home,
  },
})
export default class HomeView extends Vue {}
</script>
