<template>
  <v-toolbar
    dark
    color="primary"
  >
    <v-toolbar-title class="white--text">システムコンサルタント インターン</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-btn
      icon
      @click="handleClickHome()"
    >
      <v-icon>home</v-icon>
    </v-btn>
    <v-menu
      left
      :nudge-width="100"
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-btn
          icon
          v-on="on"
        >
          <v-icon>apps</v-icon>
        </v-btn>
      </template>
      <v-card>
        <div class="menu-container flex-grow-1">
          <div
            v-ripple
            class="selectable-row align-center d-flex pa-2"
            @click="handleClickMaskCheck()"
          >
            <v-icon class="justify-start">masks</v-icon>
            <div>マスク判定</div>
          </div>
          <div
            v-ripple
            class="selectable-row align-center d-flex pa-2"
            @click="handleClickTextToSpeech()"
          >
            <v-icon class="justify-start">question_answer</v-icon>
            <div>TextToSpeech</div>
          </div>
          <div
            v-ripple
            class="selectable-row align-center d-flex pa-2"
            @click="handleClickChat()"
          >
            <v-icon class="justify-start">voice_chat</v-icon>
            <div>音声チャット</div>
          </div>
          <div
            v-ripple
            class="selectable-row align-center d-flex pa-2"
            @click="handleClickReception()"
          >
            <v-icon class="justify-start">store</v-icon>
            <div>受付</div>
          </div>
        </div>
      </v-card>
    </v-menu>
  </v-toolbar>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

@Component({
  name: "Header",
  components: {},
})
export default class Header extends Vue {
  items = [
    { title: "Click Me" },
    { title: "Click Me" },
    { title: "Click Me" },
    { title: "Click Me 2" },
  ]
  handleClickHome() {
    this.$router.push("/", () => {})
  }
  handleClickMaskCheck() {
    this.$router.push("/maskcheckview", () => {})
  }
  handleClickTextToSpeech() {
    this.$router.push("/texttospeechview", () => {})
  }
  handleClickChat() {
    this.$router.push("/chatview", () => {})
  }
  handleClickReception() {
    this.$router.push("/receptionview", () => {})
  }
  handleClickReceptionEnglish() {
    this.$router.push("/receptionenglishview", () => {})
  }
}
</script>

<style lang="stylus" scoped>
.menu-container {
  display: flex;
  flex-flow: column;
}
</style>
