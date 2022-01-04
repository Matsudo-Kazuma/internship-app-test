<template>
  <mask-check />
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MaskCheck from "../components/MaskCheck.vue";

@Component({
  name: "MaskCheckView",
  components: {
    "mask-check": MaskCheck
  },
})
export default class MaskCheckView extends Vue {
}
</script>
