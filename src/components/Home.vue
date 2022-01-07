<template>
  <div>インターンの説明</div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"

@Component({
  name: "Home",
  components: {},
})
export default class Home extends Vue {
  // 変数
  message = ""
  count = 0
  isDisplayMessage = false
  // 関数
  change() {
    this.message = "こんにちは"
    this.count = 1
    this.isDisplayMessage = true
  }
}
</script>

<style></style>
