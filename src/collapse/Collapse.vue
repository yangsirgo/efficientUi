<template>
    <div class="gd-collapse">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "Collapse",
        props:{
            value:[Array,String,Number],
            accordion:{
                type: Boolean,
                default:false
            }
        },
        data(){
            return {
                showIndex:this.value
            }
        },
        methods : {
            toggle (data) {
                var showIndex = this.getActiveKey();
                let newActiveKey = [];
                if (this.accordion) {
                    if(!data.isActive) {
                        newActiveKey.push(data.index);
                    }
                } else {
                    if(showIndex.indexOf(data.index) > -1) {
                        showIndex.splice(showIndex.indexOf(data.index),1);
                    } else {
                        showIndex.push(data.index);
                    }
                    newActiveKey = showIndex;
                }
                this.showIndex = newActiveKey;
                this.setActive();
                this.$emit('input',newActiveKey);
                this.$emit('on-change',newActiveKey);
            },
            getActiveKey() {
                let showIndex = this.showIndex || [];
                let showIndexIsArray = Array.isArray(showIndex);
                let accordion = this.accordion;
                if(!showIndexIsArray) {
                    showIndex = [this.showIndex];
                };
                if(accordion && showIndexIsArray > 1) {//手风琴模式
                    showIndex = [showIndex[0]];
                };
                return showIndex;//手风琴效果 只有一个值得数组  数组的情况下 内部很多值
            },
            setChildIndex () {
                //子组件设置索引
                this.$children.forEach((child,index)=>{
                    child.index = index;
                })
            },
            setActive () {
                let showIndex = this.getActiveKey();
                let accordion = this.accordion;
                let $children = this.$children;
                $children.forEach((child,index)=>{
                    child.contentShow = showIndex.indexOf(child.index) > -1;
                });
            }
        },
        watch : {
            value (val) {
                this.showIndex = val
            },
            showIndex () {
                this.setActive();
            }
        },
        mounted() {
            this.setChildIndex();
            this.setActive();
        }
    }
</script>

<style scoped>

</style>