<template>
    <div class="gd-tag-double" ref="tag">
        <input type="text" class="gd-tag-label" v-model="label">
        <input type="text" class="gd-tag-value" v-model="value">
        <i class="icon-close" @click="del(data)"></i>
    </div>
</template>
<script>
export default {
    props: ['data', 'label', 'value'],
    methods: {
        del(data) {
            if (data) {
                this.$emit('delete', data);
            } else {
                this.$emit('delete');
            }
            $(this.$refs.tag).remove();
            this.$destroy();
        }
    },
    mounted() {
        if (this.$refs.tag.getAttribute('disabled')) {
            $(this.$refs.tag)
                .find('input')
                .attr('disabled', 'disabled');
        }
    }
};
</script>