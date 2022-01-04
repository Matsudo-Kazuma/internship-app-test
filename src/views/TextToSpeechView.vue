<template>
  <text-to-speech />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import TextToSpeech from "../components/TextToSpeech.vue";

@Component({
  name: "TextToSpeechView",
  components: {
    "text-to-speech": TextToSpeech
  },
})
export default class TextToSpeechView extends Vue {
}
</script>
