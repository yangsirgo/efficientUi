<template>
    <div class="gd-collapse-pane">
        <div :class="titleCls" @click.prevent.stop="clickTitle">
            <i class="icon-down" v-if="!hideArrow"></i>
            <slot></slot>
        </div>
        <collapse-transition>
            <div class="gd-collapse-content" v-show="contentShow">
                <slot name="content"></slot>
            </div>
        </collapse-transition>
    </div>
</template>

<script>

    import CollapseTransition from "../transition/collapse-transition";

    export default {
        name: "pane",
        props: {
            hideArrow : {
                type: Boolean,
                default:false
            }
        },
        data(){
            return {
                contentShow:false,
                index:0
            }
        },
        components:{CollapseTransition},
        methods:{
            clickTitle(){
                this.$parent.toggle({
                    index:this.index,
                    isActive:this.contentShow
                })
            }
        },
        computed:{
            titleCls () {
                return [
                    'gd-collapse-title',
                    {
                        'gd-collapse-title-bordernone':!this.contentShow
                    }
                ]
            }
        },
        mounted() {
            // this.parentAccordion = this.$parent.accordion;

        }
    }
</script>

<style scoped>

</style>