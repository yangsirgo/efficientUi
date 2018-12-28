<template>
    <div :class="wrapClasses" :style="styles">
        <div class="step-tail">
            <i class="step-line"></i>
        </div>
        <div class="step-head">
            <div class="step-head-inner">
                <i :class="iconCls" v-if="!icon && currentStatus != 'done'">{{stepNumber}}</i>
                <i :class="iconCls" v-else></i>
            </div>
        </div>
        <div class="step-body">
            <span class="steps-title">{{title}}</span>
            <div class="steps-content">{{content}}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "step",
        props:{
            status: {
                validator (value) {
                    return ['wait', 'progress', 'done', 'error'].indexOf(value) > -1;
                },
                default:'wait'
            },
            title: {
                type: String,
                default: ''
            },
            content: {
                type: String
            },
            icon: {
                type: String
            }
        },
        data () {
            return {
                stepNumber: '',
                total: 1,
                currentStatus: ''
            };
        },
        computed:{
            iconCls () {
                if(!this.icon) {
                    if(this.currentStatus === 'done') {
                        return [
                            'step-icon',
                            'icon-success'
                        ]
                    } else {
                        return [
                            'step-icon'
                        ]
                    }

                } else {
                    return [this.icon];
                }
            },
            wrapClasses(){
                return [
                    `step-item`,
                    `step-${this.currentStatus}`,
                    {
                        [`step-custom`]: !!this.icon,
                        ['lastStep']:this.stepNumber === this.total
                    }
                ];
            },
            styles () {
                return {
                    width: `${1/this.total*100}%`
                };
            }
        }
    }
</script>

<style scoped>

</style>