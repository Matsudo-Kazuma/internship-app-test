<script lang="ts">
import {Component, Mixins, Prop} from "vue-property-decorator";
import {Bar, mixins} from "vue-chartjs";
import {ChartData, ChartOptions} from "chart.js";

@Component
export default class ChartBar extends Mixins(Bar, mixins.reactiveProp) {
  @Prop()
  public chartData!: ChartData

  @Prop()
  public options!: ChartOptions

  public mounted() {
      this.renderChart(this.chartData, this.options)
  }
}
</script>