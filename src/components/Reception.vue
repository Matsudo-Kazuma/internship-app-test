<template>
  <div class="fill-height px-2 py-2">
    <h1>受付アプリ</h1>
    <div class="d-flex align-center">
      <v-btn color="primary lighten-2" @click="init()"> Start </v-btn>
      <v-btn color="error lighten-2" @click="clickStop()"> Stop </v-btn>
    </div>
    <div class="d-flex align-center">
      <div class="d-flex justify-center display-1">
        人数：{{ numberOfPeople }}
      </div>
      <div class="d-flex align-center display-1">
        <span class="ma-0">喫煙：</span>
        <v-checkbox readonly color="green" v-model="isSmoking" />
      </div>
    </div>
    <div class="face-component">
      <img class="face" :src="imageSrc">
      <div v-if="responseComment" class="says">
        <p>{{ responseComment }}</p>
      </div>
    </div>
    <!-- カメラとグラフの表示 -->
    <!-- <div class="webcam-result-container py-4">
      <div class="webcam-container">
        <div id="webcam-canvas"></div>
        <div v-if="displayChart" class="chart-component">
          <chart-bar :chart-data=chartData :options=options />
        </div>
      </div>
    </div> -->
  </div>
</template>

<script lang="ts">
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import * as speechCommands from "@tensorflow-models/speech-commands";
import { Component, Vue } from "vue-property-decorator";
import { processType } from "@/types/type"
import ChartBar from "@/components/molecules/ChartBar.vue";
import 'chartjs-plugin-colorschemes';
import waiter from "@/assets/waiter.png";
import waiterWelcome from "@/assets/waiter_welcome.png";
import waiterPoint from "@/assets/waiter_point.png";
import waiterGuid from "@/assets/waiter_guid.png";
import waiterStop from "@/assets/waiter_stop.png";

@Component({
  name: "Reception",
  components: {ChartBar}
})
export default class Reception extends Vue {

  // ここから ==============================================================
  // 変数
  // 受付のメッセージ
  responseComment = "";
  // 人数
  numberOfPeople: number = 0;
  // 喫煙フラグ
  isSmoking: boolean = false;
  // 来客フラグ
  // カメラに人が映ったら、受付を開始する仕様にする場合true
  isHumanCheck: boolean = false;
  // URL
  // 画像_人有、人無
  humanUrl: string = "https://teachablemachine.withgoogle.com/models/cqw-HfPiy/";
  // 画像_マスクあり、なし
  maskUrl: string = "https://teachablemachine.withgoogle.com/models/XQjkF2i-ah/";
  // 音声_受付
  chatUrl = "https://teachablemachine.withgoogle.com/models/pzDLFYFND/";

  // 関数
  // 引数のmaxClassがTeachableMachineで設定したクラス名となる
  // 「ひとり」,「ふたり」,「さんにん」,「はい」,「いいえ」
  chat(maxClass: string) {
    // 人数を明示していない状態で、「はい」、「いいえ」と答えた場合
    if (this.numberOfPeople === 0 && (maxClass === "はい" || maxClass === "いいえ")) {
      this.responseComment = "人数を教えてください"
      this.speak()
      return
    }

    // 処理の分岐
    switch (maxClass) {
      case 'ひとり':
        // レスポンス用のコメントを設定
        this.responseComment = "1名様ですね。喫煙席をご利用でしょうか？"
        // ここに人数を設定
        this.numberOfPeople = 1
        break;
      case 'ふたり':
        this.responseComment = "2名様ですね。喫煙席をご利用でしょうか？"
        this.numberOfPeople = 2
        break;
      case 'さんにん':
        this.responseComment = "3名様ですね。喫煙席をご利用でしょうか？"
        this.numberOfPeople = 3
        break;
      case 'はい':
        // レスポンス用のコメントを設定
        this.responseComment = "案内の前にマスクの確認をいたします。"
        // ここに喫煙席かのフラグを設定
        this.isSmoking = true
        // マスクチェック開始
        this.initMaskCheck()
        break;
      case 'いいえ':
        this.responseComment = "案内の前にマスクの確認をいたします。"
        this.isSmoking = false
        // マスクチェック開始
        this.initMaskCheck()
        break;
      default:
        return
    }
    // ウェイターがしゃべる
    this.speak()    
  }

  // ここまで ====================================================



  // Data ==============================================
  // プロセス -------------------------------------------
  // 1.人感チェック
  // 2.マスクチェック
  process: processType = "human"

  // 画像 ----------------------------------------------
  model: tmImage.CustomMobileNet = {} as tmImage.CustomMobileNet;
  webcam: tmImage.Webcam = new tmImage.Webcam(300, 300, true);
  maxPredictions: number = 0;
  isCameraStop: boolean = false;
  
  // textToSpeach ---------------------------------------
  synth = window.speechSynthesis;
  voices: SpeechSynthesisVoice[] = [];

  // chat -----------------------------------------------
  isVoiceStop: boolean = false;
  ignoreClass: string[] = ["バックグラウンド ノイズ", "その他"]
  isChatStop: boolean = false;

  // 画像 ------------------------------------------------
  imageSrc = waiter;

  // グラフ -----------------------------------------------
  chartData = {};
  options = {
    plugins: {
      colorschemes: {
          scheme: 'brewer.Paired12'
      }
    },
    legend: {
      display: true,
      position: 'bottom'
    },
    scales: {
      yAxes : [{
          ticks: {
            max: 1,
            min: 0,
            stepSize: 0.1
          }
      }]
    },
    tooltips: {
      enabled: false
    }
  };

  // getter ================================================
  get displayChart() {
    return !!Object.keys(this.chartData).length;
  }
  get selectedVoice() {
    return this.voices.find(x => x.name === "Google 日本語")
  }

  // ライフサイクル ==========================================
  destroyed() {
    console.log("destroyed")
    this.clickStop();
  }

  // function ==============================================
  // 共通
  async init() {
    console.log("start");
    // リセット
    this.reset();    
    // 音声データ取得
    this.voices = this.synth.getVoices();
    
    // 来客フラグで処理を分岐
    if (this.isHumanCheck) {
      this.initHumanCheck()
    } else {
      this.initRecept()
    }
  }

  clickStop() {
    console.log("stop");
    this.isChatStop = true;
    this.isCameraStop = true;
    // リセット
    this.reset();
  }

  reset() {
    this.responseComment = "";
    this.imageSrc = waiter;
    this.numberOfPeople = 0;
    this.isSmoking = false;
  }

  speak() {
    if (this.synth.speaking) {
        console.log('speechSynthesis.speaking');
        return;
    }
    var utterThis = new SpeechSynthesisUtterance(this.responseComment);
    utterThis.pitch = 1;
    utterThis.rate = 1;
    if(this.selectedVoice) utterThis.voice = this.selectedVoice;
    this.synth.speak(utterThis);
  }

  // image --------------------------------------------------
  initHumanCheck() {
    this.process = "human";
    this.initCamera(this.humanUrl)
  }

  initMaskCheck() {
    this.process = "mask"
    // チャット停止
    this.isChatStop = true
    // マスクチェック開始
    this.imageSrc = waiterPoint
    this.webcam = new tmImage.Webcam(300, 300, true);
    this.initCamera(this.maskUrl)
  }

  async initCamera(URL: string) {
    this.isCameraStop = false;

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    this.model = await tmImage.load(modelURL, metadataURL);
    this.maxPredictions = this.model.getTotalClasses();

    await this.webcam.setup(); // request access to the webcam
    await this.webcam.play();
    window.requestAnimationFrame(this.loop);

    document
      .getElementById("webcam-canvas")
      ?.appendChild(this.webcam.canvas);
  }

  async loop() {
    if (this.isCameraStop) {
      await this.webcam.pause();
      return
    }
    this.webcam.update();
    await this.predict();
    window.requestAnimationFrame(this.loop);
  }

  async predict() {
    const prediction = await this.model.predict(this.webcam.canvas);

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
      datasets
    }
    // リスト内で一番大きい値を取得
    const maxValue = prediction.reduce((acc, o) =>
      !acc || o.probability > acc.probability ? o : acc
    ).probability;
    if(maxValue < 0.9) {
      return
    }
    // リスト内で一番大きいClass名を取得
    const maxClass = prediction.reduce((acc, o) =>
      !acc || o.probability > acc.probability ? o : acc
    ).className;

    // スピーチ中の場合はここで処理を止める
    if (this.synth.speaking) return

    switch (this.process) {
      case "human":
        await this.humanCheck(maxClass)
        break;
      case "mask":
        this.maskCheck(maxClass)
        break;
      default:
        break;
    }
  }

  async humanCheck(maxClass: string) {
    if (maxClass === "人有") {
      this.isCameraStop = true
      await this.initRecept()
    }
  }

  maskCheck(maxClass: string) {
    if (maxClass === "マスクあり") {
      this.imageSrc = waiterGuid;      
      this.responseComment = "マスクの装着が確認できました。お席へどうぞ。";
      // カメラを止める
      this.isCameraStop = true
    }
    else if (maxClass === "マスクなし" && this.responseComment !== "マスクを装着してください。") {
      this.imageSrc = waiterStop;            
      this.responseComment = "マスクを装着してください。";
    }
    else return

    this.speak()
  }

  // chat --------------------------------------------------------
  async initRecept() {
    this.imageSrc = waiterWelcome;
    setTimeout(() => { this.imageSrc = waiter }, 1000);
    this.responseComment = "いらっしゃいませ、何名様でしょうか？";
    this.speak()
    await this.initChat()
  }
  async initChat() {
    this.isChatStop = false;
    const recognizer = await this.createModel();
    const classLabels = recognizer.wordLabels(); // get class labels

    recognizer.listen(async result => {
        if (this.isChatStop) {
          recognizer.stopListening()
        }
        const scores = result.scores; // probability of prediction for each class
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
          datasets
        }
        // レスポンス解析
        const maxValue = Math.max(...scores);
        const maxClassIndex = scores.indexOf(maxValue);
        const maxClassLabel = classLabels[maxClassIndex]
        // スピーチ中の場合はここで処理を止める    
        if(maxValue > 0.5 && !this.ignoreClass.includes(maxClassLabel) && !this.synth.speaking) {
            this.chat(maxClassLabel)
        } 
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: false,
        overlapFactor: 0.5 // probably want between 0.5 and 0.75. More info in README
    });
  }

  async createModel() {
    const checkpointURL = this.chatUrl + "model.json"; // model topology
    const metadataURL = this.chatUrl + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
  }
  
}
</script>

<style lang="stylus" scoped>
.face-component {
  display: flex;
  align-items: center;
  padding: 20px 200px;
}

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
  width: 800px;
  height: 400px;
}

img.face {
  width: 200px;
  height: 300px;
  border: solid 3px #d7ebfe;
}

.says {
  display: inline-block;
  position: relative;
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
</style>