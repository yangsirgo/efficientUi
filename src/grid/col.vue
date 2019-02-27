<template>
    <div :class="cls">
        <slot></slot>
    </div>
</template>

<script>
    const prefix = 'gd';
    export default {
        props : {
            span : [String,Number],
        },
        computed : {
            cls () {
                return [
                    {
                        [`${prefix}-col`]:true,
                        [`${prefix}-col-span-${this.span}`]:this.span,
                    }
                ]
            }
        }
    }
</script>

<style scoped>

</style>