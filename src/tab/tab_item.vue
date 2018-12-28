<template>
    <div class="gd-tab-item" :style="{zIndex:show?'1':'0'}">
        <slot></slot>
    </div>
</template>
<script>
export default {
    props: {
        label: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            show: true
        };
    },
    methods: {
        updateNav() {
            //$parent 父链，通知父组件（tabs）进行更新。
            this.$parent.updateNav();
        }
    },
    //监听label
    watch: {
        label() {
            this.updateNav();
        }
    },

    mounted() {
        //初始化tabs
        this.updateNav();
    }
};
</script>

<style>
</style>