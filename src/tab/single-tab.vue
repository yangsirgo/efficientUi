<template>
    <div :class="classes" :name="name">
        <div :class="sizeCls" ></div>
        <slot></slot>
    </div>
</template>
<script>

    import {oneOf} from "../utils/assist"
    const prefixCls = 'gd-tab-single';

    let seed = 0;
    const now = Date.now();
    const getUuid = () => `gdRadioGroup_${now}_${seed++}`;

    export default {
        props : {
            value: {
                type: [String, Number],
                default: ''
            },
            name: {
                type: String,
                default: getUuid
            },
            size: {
                type: String,
                validator (value) {
                    return oneOf(value, ['small', 'large']);
                },
                default : 'small'
            },
        },
        data(){
            return {
                currentValue: this.value
            }
        },
        methods: {
            getLabels(){
                return this.$slots;
            },
            updateValue(){
                var _t = this;
                if (this.$children) {
                    this.$children.forEach((child,index)=> {
                        child.currentValue = this.value === child.label;
                        if(child.currentValue){
                            this.goAnimate(index);
                        }
                        child.index = index;
                    });
                }
            },
            goAnimate(a){
                let animateDom = $(this.$el).find(".js-tabs-animated");
                animateDom.css({
                      transform: "translate3d(" + (a * animateDom.width()) + "px, 0px, 0px)"
                  });
            },
            change (data) {
                this.currentValue = data.value;
                this.updateValue();
                this.$emit('input', data.value);
                this.$emit('change', data.value);
                this.goAnimate(data.checkedIndex);
            }
        },
        computed: {
            classes () {
                return [
                    `${prefixCls}`
                ];
            },
            sizeCls(){
                return [
                    "js-tabs-animated",
                    {
                            [`${this.size}`]:!!this.size
                    }
                ];
            }
        },
        watch: {
            value () {
                this.currentValue = this.value;
                this.updateValue();
            }
        }
    }
</script>

<style>

</style>