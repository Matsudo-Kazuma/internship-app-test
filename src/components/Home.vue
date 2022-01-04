<template>
  <div>インターンの説明</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component({
  name: "Home",
  components: {
  },
})
export default class Home extends Vue {
  // 変数
  message: string = ""
  count: number = 0
  isDisplayMessage: boolean = false
  // 関数
  change() {
    this.message = "こんにちは"
    this.count = 1
    this.isDisplayMessage = true
  }
}
</script>

<style>

</style>