<template>
    <div :class="cls">
        <span class="inner-text" v-if="isInnerText">
            <slot></slot>
        </span>
    </div>
</template>

<script>
    export default {
        name: "divider",
        props:{
            type:{
                type: String,
                validator (value) {
                    return ['horizontal', 'vertical'].indexOf(value) > -1;
                },
                default: 'horizontal'
            },
            orientation : {
                type: String,
                validator (value) {
                    return ['left', 'right', 'center'].indexOf(value) > -1;
                },
                default: 'center'
            },
            dashed : {
                type: Boolean,
                default: false
            }
        },
        data () {
            let isInnerText = this.$slots.default != undefined ? true : false;
            return {
                isInnerText:isInnerText
            }
        },
        methods:{


        },
        computed:{
            cls(){
                let type = this.type;

                return [
                    'gd-divider',
                    `gd-divider-${type}`,
                    {
                        'gd-divider-with-text':this.isInnerText,
                        'gd-divider-with-left-text':this.isInnerText && (this.orientation === 'left'),
                        'gd-divider-with-right-text':this.isInnerText && (this.orientation === 'right'),
                        'gd-divider-dashed':this.dashed
                    }
                ]
            }
        }

    }
</script>

<style scoped>

</style>