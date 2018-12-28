<template>
    <div class="steps">
        <slot></slot>
    </div>
</template>

<script>
    export default {
        name: "steps",
        props:{
            current: {
                type: Number,
                default: 0
            },
            status: {
                validator (value) {
                    return value ? (['wait', 'progress', 'done', 'error',''].indexOf(value) > -1) : false;
                },
                default: 'progress'
            },
        },
        watch: {
            current () {
                this.updateChildProps();
            },
            status () {
                this.updateCurrent();
            }
        },
        mounted () {
            this.updateSteps();
        },
        methods:{
            updateSteps(){
                this.updateChildProps(true);
                this.updateCurrent(true);
            },
            updateChildProps(isInit){
                const total = this.$children.length;
                this.$children.forEach((child, index) => {
                    child.total = total;
                    child.stepNumber = index + 1;
                    if (!(isInit && child.currentStatus)) {
                        if (index == this.current) {
                            if (this.status != 'error') {
                                child.currentStatus = 'progress';
                            }
                        } else if (index < this.current) {
                            child.currentStatus = 'done';
                        } else {
                            child.currentStatus = 'wait';
                        }
                    }

                })
            },
            updateCurrent(isInit){
                // 防止溢出边界
                if (this.current < 0 || this.current >= this.$children.length ) {
                    return;
                }
                if (isInit) {
                    const current_status = this.$children[this.current].currentStatus;
                    if (!current_status) {
                        this.$children[this.current].currentStatus = this.status;
                    }
                } else {
                    this.$children[this.current].currentStatus = this.status;
                }
            }
        }
    }
</script>

<style scoped>

</style>