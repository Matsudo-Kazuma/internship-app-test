<template>
  <div class="fill-height px-2">
    <h1>マスク判定アプリ</h1>
    <div class="d-flex align-center">
      <v-btn
        color="primary lighten-2"
        @click="init()"
      > Start </v-btn>
      <v-btn
        color="error lighten-2"
        @click="clickStop()"
      > Stop </v-btn>
    </div>
    <div class="webcam-result-container py-4">
      <div class="webcam-container">
        <div id="webcam-canvas"></div>
        <div
          v-if="displayChart"
          class="chart-component"
        >
          <chart-bar
            :chart-data="chartData"
            :options="options"
          />
        </div>
      </div>
      <div class="d-flex display-2 py-4">{{ message }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import * as tmImage from "@teachablemachine/image"
import { Component, Vue } from "vue-property-decorator"
import ChartBar from "@/components/molecules/ChartBar.vue"
import "chartjs-plugin-colorschemes"

@Component({
  name: "MaskCheck",
  components: { ChartBar },
})
export default class MaskCheck extends Vue {
  // ここから ==============================================================
  // 変数
  // 画面に表示するメッセージ
  message = ""
  // マスクチェックでエクスポートしたモデルのURL
  url = "https://teachablemachine.withgoogle.com/models/XQjkF2i-ah/"

  // 関数
  // 引数のmaxClassがTeachableMachineで設定したクラス名となる
  // 「マスクあり」,「マスクなし」
  maskCheck(maxClass: string) {
    if (maxClass === "マスクあり") {
      // マスクあり　表示メッセージ
      this.message = "マスクの装着が確認できました"
    } else if (maxClass === "マスクなし") {
      // マスクなし　表示メッセージ
      this.message = "マスクを装着してください"
    }
  }
  // ここまで ==============================================================

  // camera
  model: tmImage.CustomMobileNet = {} as tmImage.CustomMobileNet
  webcam: tmImage.Webcam = new tmImage.Webcam(300, 300, true)
  maxPredictions = 0
  isStop = false
  nowClass = ""
  // textToSpeach
  synth = window.speechSynthesis
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

  // Load the image model and setup the webcam
  async init() {
    console.log("start")
    this.isStop = false

    const URL = this.url
    const modelURL = URL + "model.json"
    const metadataURL = URL + "metadata.json"

    this.model = await tmImage.load(modelURL, metadataURL)
    this.maxPredictions = this.model.getTotalClasses()

    await this.webcam.setup() // request access to the webcam
    await this.webcam.play()
    window.requestAnimationFrame(this.loop)

    // append elements to the DOM
    document.getElementById("webcam-canvas")?.appendChild(this.webcam.canvas)
  }

  clickStop() {
    console.log("stop")
    this.isStop = true
  }

  async loop() {
    if (this.isStop) {
      await this.webcam.pause()
      return;
    }
    this.webcam.update() // update the webcam frame
    await this.predict()
    window.requestAnimationFrame(this.loop)
  }

  async predict() {
    const prediction = await this.model.predict(this.webcam.canvas)

    // グラフの描画データ作成
    const datasets = prediction.map((x) => {
      return {
        type: "bar",
        label: x.className,
        data: [x.probability.toFixed(2)],
        fill: true,
      }
    })
    this.chartData = {
      datasets,
    }
    // リスト内で一番大きい値を取得
    const maxValue = prediction.reduce((acc, o) =>
      !acc || o.probability > acc.probability ? o : acc
    ).probability
    if (maxValue < 0.8) {
      this.message = "カメラに顔を表示してください"
      this.nowClass = "その他"
      return
    }
    // リスト内で一番大きいClass名を取得
    const maxClass = prediction.reduce((acc, o) =>
      !acc || o.probability > acc.probability ? o : acc
    ).className

    console.log("maxClass", maxClass)
    // クラスの変更がなければ処理を終了
    if (maxClass === this.nowClass) return
    // クラスの更新
    this.nowClass = maxClass
    // mask check
    this.maskCheck(maxClass)
  }

  speak() {
    if (this.synth.speaking) {
      console.error("speechSynthesis.speaking")
      return
    }
    var utterThis = new SpeechSynthesisUtterance(this.message)
    utterThis.pitch = 1
    utterThis.rate = 1
    this.synth.speak(utterThis)
  }
}
</script>

<style lang="stylus" scoped>
.webcam-result-container {
  display: flex;
  flex-flow: column;
  align-items: center;
}

.webcam-container {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.chart-component {
  width: 300px;
  height: 200px;
}
</style>
