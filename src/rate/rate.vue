<template>
    <div class="score-star-wrap" @mouseleave="starleave">
        <div :class="scoreStarCls(item)"
             v-for="item in starNum"
             @mouseover="starhover(item,$event)"
             @click="starClick(item)">
            <span type="half" :class="halfCls(item)" v-if="allowHalf"></span>
        </div>
    </div>
</template>

<script>
    export default {
        name: "rate",
        props:{
            count:{
                type:Number,
                default:5
            },
            value : {
                type:Number,
                default:0
            },
            allowHalf:{
                type:Boolean,
                default:false
            }
        },
        data () {
            return {
                starNum : this.count,
                hoverIndex: -1,
                currentIndex:this.value,
                isHalf:false
            }
        },
        watch : {
            value (val) {
                this.currentIndex = val;
            }
        },
        methods : {
            halfCls (item) {

                log(item);
                return [
                    'score-star-half',
                    {
                     'score-star-half-full':this.isHalf && (this.currentIndex === item)
                    }
                ]
            },
            starClick (item) {
                this.currentIndex = item;
                this.$emit('input',item)
            },
            starhover (item,event) {
                const type = event.target.getAttribute('type') || false;
                if(type === 'half' && this.allowHalf) {
                    this.isHalf = true;
                }
                this.hoverIndex = item;
            },
            scoreStarCls (item) {
                let isZero = true;
                let isFull = false;

                if(item <= this.hoverIndex || this.currentIndex >= item) {
                    isFull = true;
                    isZero = false;
                }

                return [
                    'score-star',
                    {
                        'score-star-zero':isZero,
                    },
                    {
                        'score-star-full':isFull
                    }
                ]
            },
            starleave (){
                this.hoverIndex = -1;
                this.isHalf = false;
            }
        },
        computed : {

        }
    }
</script>

<style scoped>

</style>