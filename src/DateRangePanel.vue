<template>
    <div class="gd-date-range-box">
        <div class="gd-datepanel-box">
            <gd-datepanel :config="dateStartPanelConfig" @selectChange="startChange" :range="true" :endDate="endDate"></gd-datepanel>
            <gd-datepanel :config="dateEndPanelConfig" @selectChange="endChange" :range="true" :startDate="startDate"></gd-datepanel>
        </div>
        <div class="gd-date-footer">
            <button class="gd-btn" :disabled="!dateRangeAvalible" @click="ok">确定</button>
            <button class="gd-btn-cancel" @click="cancel">取消</button>
        </div>
    </div>
</template>
<script>
export default {
    props: ['config'],
    data() {
        let dateStartPanelConfig = {};
        let dateEndPanelConfig = {};
        let startDate = '';
        let endDate = '';
        if ($.isArray(this.config.value) && this.config.value.length == 2) {
            let _startDate = this.config.value[0].split(' ')[0];
            let _endDate = this.config.value[1].split(' ')[0];
            if (_startDate) {
                dateStartPanelConfig.value = _startDate;
                startDate += _startDate;
            }
            if (_endDate) {
                dateEndPanelConfig.value = _endDate;
                endDate += _endDate;
            }
            if (this.config.timePicker) {
                let startTime = this.config.value[0].split(' ')[1];
                let endTime = this.config.value[1].split(' ')[1];
                if (startTime) {
                    dateStartPanelConfig.timeValue = startTime;
                    startDate += ' ' + startTime;
                }
                if (endTime) {
                    dateEndPanelConfig.timeValue = endTime;
                    endDate += ' ' + endTime;
                }
            }
        }
        if (this.config.timePicker) {
            dateStartPanelConfig.timePicker = true;
            dateEndPanelConfig.timePicker = true;
        }
        if (this.config.maxDate) {
            dateStartPanelConfig.maxDate = this.config.maxDate;
            dateEndPanelConfig.maxDate = this.config.maxDate;
        }
        if (this.config.minDate) {
            dateStartPanelConfig.minDate = this.config.minDate;
            dateEndPanelConfig.minDate = this.config.minDate;
        }
        if (this.config.timeStep) {
            dateStartPanelConfig.timeStep = this.config.timeStep;
            dateEndPanelConfig.timeStep = this.config.timeStep;
        }
        return {
            startDate, //起始日期
            endDate, //结束日期
            dateStartPanelConfig,
            dateEndPanelConfig
        };
    },
    methods: {
        //起始日期改变
        startChange(date) {
            this.startDate = date;
        },
        //结束日期改变
        endChange(date) {
            this.endDate = date;
        },
        //确定
        ok() {
            let dateStr = this.dateStr.replace(/\//g, '-');
            if (typeof this.config.change === 'function') {
                typeof this.config.change(dateStr);
            }
            this.$emit('change', this.dateStr);
        },
        //取消
        cancel() {
            this.$emit('cancel');
        }
    },
    computed: {
        //日期范围是否有效
        dateRangeAvalible() {
            let startDate = gd.newDate(this.startDate);
            let endDate = gd.newDate(this.endDate);
            let minDate = '';
            let maxDate = '';
            if (this.config.minDate) {
                minDate = getZeroDate(gd.newDate(this.config.minDate));
            }
            if (this.config.maxDate) {
                maxDate = getZeroDate(gd.newDate(this.config.maxDate));
                maxDate.setDate(maxDate.getDate() + 1);
            }
            if (gd.isDate(startDate) && gd.isDate(endDate)) {
                if (startDate <= endDate) {
                    if (minDate && maxDate) {
                        return startDate >= minDate && endDate < maxDate;
                    } else if (minDate) {
                        return startDate >= minDate;
                    } else if (maxDate) {
                        return endDate < maxDate;
                    }
                    return true;
                } else {
                    return false;
                }
            }
            return false;
        },
        //日期范围字符串
        dateStr() {
            if (this.dateRangeAvalible) {
                return this.startDate.replace(/\//g, '-') + ' ~ ' + this.endDate.replace(/\//g, '-');
            } else {
                return '';
            }
        }
    },
    watch: {},
    mounted() {}
};
/**
 * 获取0点日期
 */
function getZeroDate(date) {
    if (gd.isDate(date)) {
        return gd.newDate(`${date.getFullYear()}-${date.getRealMonth()}-${date.getDate()} 00:00`);
    }
    return date;
}
</script>