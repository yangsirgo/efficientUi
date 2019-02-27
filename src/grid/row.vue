<template>
    <div :class="cls">
        <slot></slot>
    </div>
</template>

<script>
    const prefix = 'gd';
    export default {
        computed : {
            cls () {
                return [
                    {
                        [`${prefix}-row`]:true
                    }
                ]
            }
        }
    }
</script>

<style scoped>

</style>