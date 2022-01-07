<template>
  <div class="fill-height px-2">
    <h1>音声受付アプリ</h1>
    <div class="d-flex align-center">
      <v-btn color="primary lighten-2" @click="init()"> Speech </v-btn>
      <v-btn color="error lighten-2" @click="clickStop()"> Stop </v-btn>
    </div>
    <div class="face-component">
      <img class="face" :src="imageSrc" />
      <div v-if="responseComment" class="says">
        <p>{{ responseComment }}</p>
      </div>
    </div>
    <div v-if="displayChart" class="chart-component">
      <chart-bar :chart-data="chartData" :options="options" />
    </div>
  </div>
</template>

<script lang="ts">
import * as tf from "@tensorflow/tfjs"
import * as speechCommands from "@tensorflow-models/speech-commands"
import closeMouse from "@/assets/mouse_close.png"
import openMouse from "@/assets/mouse_open.png"
import ChartBar from "@/components/molecules/ChartBar.vue"
import "chartjs-plugin-colorschemes"

import { Component, Vue, Watch } from "vue-property-decorator"

@Component({
  name: "Chat",
  components: { ChartBar },
})
export default class Chat extends Vue {
  // ここから ==============================================================
  // エイリアンのメッセージ
  responseComment = ""
  // 音声チェックでエクスポートしたモデルのURL
  url = "https://teachablemachine.withgoogle.com/models/pzDLFYFND/"

  // 関数
  // 引数のmaxClassがTeachableMachineで設定したクラス名となる
  // 「ひとり」,「ふたり」,「さんにん」,「はい」,「いいえ」
  chat(maxClass: string) {
    // 処理の分岐
    switch (maxClass) {
      case "ひとり":
        // レスポンス用のコメントを設定
        this.responseComment = "ひとりですね"
        break
      case "ふたり":
        this.responseComment = "ふたりですね"
        break
      case "さんにん":
        this.responseComment = "さんにんですね"
        break
      case "はい":
        // レスポンス用のコメントを設定
        this.responseComment = "はいですね"
        break
      case "いいえ":
        this.responseComment = "いいえですね"
        break
      default:
        return
    }
    // エイリアンがしゃべる
    this.speak()
  }

  // ここまで ==============================================================

  isStop = false
  ignoreClass: string[] = ["バックグラウンド ノイズ", "その他"]
  // textToSpeach
  synth = window.speechSynthesis
  inputComment = ""
  // リップシンク
  isClose = true
  imageSrc = closeMouse
  // グラフ
  chartData = {}
  options = {
    plugins: {
      colorschemes: {
        scheme: "brewer.Paired12",
      },
    },
    legend: {
      display: true,
      position: "bottom",
    },
    scales: {
      yAxes: [
        {
          ticks: {
            max: 1,
            min: 0,
            stepSize: 0.1,
          },
        },
      ],
    },
    tooltips: {
      enabled: false,
    },
  }

  get displayChart() {
    return !!Object.keys(this.chartData).length
  }

  destroyed() {
    console.log("destroyed")
    this.clickStop()
  }

  async createModel() {
    const checkpointURL = this.url + "model.json" // model topology
    const metadataURL = this.url + "metadata.json" // model metadata

    const recognizer = speechCommands.create(
      "BROWSER_FFT", // fourier transform type, not useful to change
      undefined, // speech commands vocabulary feature, not useful for your models
      checkpointURL,
      metadataURL
    )

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded()

    return recognizer
  }

  async init() {
    this.isStop = false
    const recognizer = await this.createModel()
    const classLabels = recognizer.wordLabels() // get class labels
    console.log("classLabels", classLabels)

    recognizer.listen(
      async (result) => {
        if (this.isStop) {
          recognizer.stopListening()
        }
        const scores = result.scores.map((x: any) => Number(x))
        // グラフの描画データ作成
        const datasets = classLabels.map((x, i) => {
          return {
            type: "bar",
            label: x,
            data: [scores[i]],
            fill: true,
          }
        })
        this.chartData = {
          datasets,
        }
        const maxValue = Math.max(...scores)
        const maxClassIndex = scores.indexOf(maxValue)
        const maxClassLabel = classLabels[maxClassIndex]
        // スピーチ中の場合はここで処理を止める
        if (
          maxValue > 0.8 &&
          !this.ignoreClass.includes(maxClassLabel) &&
          !this.synth.speaking
        ) {
          this.chat(maxClassLabel)
        }
      },
      {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: false,
        overlapFactor: 0.75, // probably want between 0.5 and 0.75. More info in README
      }
    )

    // 5000ms後に停止
    // setTimeout(() => recognizer.stopListening(), 5000);
  }

  speak() {
    if (this.synth.speaking) {
      console.error("speechSynthesis.speaking")
      return
    }

    if (this.responseComment === "") return

    var utterThis = new SpeechSynthesisUtterance(this.responseComment)
    utterThis.pitch = 1
    utterThis.rate = 1

    this.synth.speak(utterThis)
    this.changeFace()
  }

  clickStop() {
    console.log("stop")
    this.isStop = true
  }

  changeFace() {
    //画像選択
    if (this.isClose) {
      this.imageSrc = openMouse
    } else {
      this.imageSrc = closeMouse
    }
    this.isClose = !this.isClose
    //0.25秒ごとに実行
    if (this.synth.speaking) setTimeout(this.changeFace, 250)
  }
}
</script>

<style lang="stylus" scoped>
.face-component {
  display: flex;
  align-items: flex-end;
  padding: 20px 100px;
}

img.face {
  width: 200px;
  height: 200px;
  border: solid 3px #d7ebfe;
  border-radius: 50%;
}

.says {
  display: inline-block;
  position: relative; /* margin: 5px 0 0 105px; */
  padding: 17px 13px;
  border-radius: 12px;
  background: #d7ebfe;
}

.says:after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 18px;
  left: -24px;
  border: 12px solid transparent;
  border-right: 12px solid #d7ebfe;
}

.says p {
  margin: 0;
  padding: 0;
}

.chart-component {
  display: flex;
  justify-content: center;
  height: 200px;
  // width: 500px;
}
</style>
