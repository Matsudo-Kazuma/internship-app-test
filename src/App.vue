<template>
  <v-app>
    <app-header />
    <router-view />
  </v-app>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component"
import Header from "@/components/global/Header.vue";

@Component({
  name: "app",
  components: {
    "app-header": Header
  },
})
export default class extends Vue {}
</script>
