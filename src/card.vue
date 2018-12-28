<template>
    <div :class="classes">
        <div :class="headClasses" v-if="showHead">
            <slot name="title"><p v-if="title">{{title}}</p></slot>
            </div>
        <div :class="extraClasses" v-if="showExtra">
            <slot name="extra"></slot>
        </div>
        <div :class="bodyClasses" :style="bodyStyles">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    let  cardPrefixCls = 'gd-card';
    let  defaultPadding = 16;
    export default {
        name: "card",
        props: {
            titleBorder:{
                type: Boolean,
                default: true
            },
            outerBordered: {
                type: Boolean,
                default: true
            },
            disHover: {
                type: Boolean,
                default: false
            },
            padding: {
                type: Number,
                default: defaultPadding
            },
            title: {
                type: String,
            }
        },
        data :function() {
            return {
                showHead: true,
                showExtra: true
            };
        },
        computed: {
            classes :function() {
                var PrefixCls = cardPrefixCls;
                return [
                    cardPrefixCls,
                    {
                        'gd-card-dis-hover': this.disHover,
                        'gd-card-bordered':this.outerBordered
                    }
                ];
            },
            headClasses :function() {
                return [
                    cardPrefixCls + "-head",
                    {'gd-card-head-border':this.titleBorder}
                ];
            },
            extraClasses :function() {
                return cardPrefixCls + "-extra";
            },
            bodyClasses :function() {
                return cardPrefixCls + "-body";
            },
            bodyStyles :function() {
                if (this.padding !== defaultPadding) {
                    return {
                        padding: this.padding + 'px'
                    };
                } else {
                    return '';
                }
            }
        },
        mounted :function() {
            this.showHead = this.title || this.$slots.title !== undefined;
            this.showExtra = this.$slots.extra !== undefined;
        }
    }
</script>
