<template>
  <div>
    <div class="fill-height justify-center px-2">
      <h1>TextToSpeech</h1>
      <v-textarea
        clearable
        no-resize
        label="テキスト"
        rows="1"
        cols="60"
        v-model="inputTxt"
      ></v-textarea>
      <v-select
          v-model="voiceName"
          :items="voices"
          item-text="name"
          item-value="name"
          label="Select"
        ></v-select>
      <div class="d-flex align-center">
        <v-btn color="primary lighten-2" @click="speak()"> Speech </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: "TextToSpeech",
  components: {
  },
})
export default class TextToSpeech extends Vue {
  synth = window.speechSynthesis;
  inputTxt = "";
  voices: SpeechSynthesisVoice[] = [];
  voiceName: string = "";
  // voice: SpeechSynthesisVoice = {
  //   voiceURI: "Microsoft Sayaka - Japanese (Japan)",
  //   name: "Microsoft Sayaka - Japanese (Japan)",
  //   lang: "ja-JP",
  //   localService: true,
  //   default: false
  // };
  voice: SpeechSynthesisVoice = {
    voiceURI: "Google 日本語",
    name: "Google 日本語",
    lang: "ja-JP",
    localService: false,
    default: false
  };

  get selectedVoice() {
    return this.voices.find(x => x.name === this.voiceName)
  }

  created() {
    this.populateVoiceList();
  }

  populateVoiceList() {
    this.voices = this.synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if ( aname < bname ) return -1;
        else if ( aname == bname ) return 0;
        else return +1;
    });
  }

  speak(){
      if (this.synth.speaking) {
          console.error('speechSynthesis.speaking');
          return;
      }

      if (this.inputTxt !== '') {
      var utterThis = new SpeechSynthesisUtterance(this.inputTxt);
      utterThis.onend = function (event) {
          console.log('SpeechSynthesisUtterance.onend');
      }
      utterThis.onerror = function (event) {
          console.error('SpeechSynthesisUtterance.onerror');
      }

      utterThis.pitch = 1;
      utterThis.rate = 1;
      // if(this.selectedVoice) utterThis.voice = this.selectedVoice;    
      if(this.selectedVoice) {
        console.log("this.selectedVoice", this.selectedVoice)
        utterThis.voice = this.selectedVoice;
      }    
      this.synth.speak(utterThis);
    }
  }



}
</script>

<style scoped>

</style>