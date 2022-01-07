<template>
  <div class="fill-height px-2">
    <div class="slide-container py-4">
      <div class="slide-component">
        <v-carousel
          :height="560"
          :cycle="false"
        >
          <v-carousel-item
            v-for="(item,i) in items"
            :key="i"
            :src="item.src"
            class="slide-size"
          ></v-carousel-item>
        </v-carousel>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator"
import slide1 from "@/assets/slide/slide1.png"
import slide2 from "@/assets/slide/slide2.png"
import slide3 from "@/assets/slide/slide3.png"
import slide4 from "@/assets/slide/slide4.png"
import slide5 from "@/assets/slide/slide5.png"
import slide6 from "@/assets/slide/slide6.png"
import slide7 from "@/assets/slide/slide7.png"
import slide8 from "@/assets/slide/slide8.png"
import slide9 from "@/assets/slide/slide9.png"
import slide10 from "@/assets/slide/slide10.png"
import slide11 from "@/assets/slide/slide11.png"
import slide12 from "@/assets/slide/slide12.png"
import slide13 from "@/assets/slide/slide13.png"
import slide14 from "@/assets/slide/slide14.png"
import slide15 from "@/assets/slide/slide15.png"
import slide16 from "@/assets/slide/slide16.png"
import slide17 from "@/assets/slide/slide17.png"
import slide18 from "@/assets/slide/slide18.png"
import slide19 from "@/assets/slide/slide19.png"
import slide20 from "@/assets/slide/slide20.png"
import slide21 from "@/assets/slide/slide21.png"

@Component({
  name: "Home",
  components: {},
})
export default class Home extends Vue {
  // 変数
  items = [
          {
            src: slide1
          },
          {
            src: slide2
          },
          {
            src: slide3
          },
          {
            src: slide4
          },
          {
            src: slide5
          },
          {
            src: slide6
          },
          {
            src: slide7
          },
          {
            src: slide8
          },
          {
            src: slide9
          },
          {
            src: slide10
          },
          {
            src: slide11
          },
          {
            src: slide12
          },
          {
            src: slide13
          },
          {
            src: slide14
          },
          {
            src: slide15
          },
          {
            src: slide16
          },
          {
            src: slide17
          },
          {
            src: slide18
          },
          {
            src: slide19
          },
          {
            src: slide20
          },
          {
            src: slide21
          }
        ]
}
</script>

<style lang="stylus" scoped>
.slide-container {
  display: flex;
  justify-content: center;
}

.slide-component {
  width: 900px;
}

.slide-size {
  height: 500px;
}
</style>
