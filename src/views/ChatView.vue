<template>
  <chat />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Chat from "../components/Chat.vue";

@Component({
  name: "ChatView",
  components: {
    "chat": Chat
  },
})
export default class ChatView extends Vue {
}
</script>
