<template>
    <div class="gd-datepanel">
        <div class="gd-datepanel-navbar">
            <i class="icon-previous gd-datepanel-navbtn" @click="prevYear"></i>
            <i class="icon-left gd-datepanel-navbtn" @click="prevMonth"></i>
            <span class="gd-datepanel-navtext" @click="viewType='year'">{{viewDate.getFullYear()}}</span>
            <span class="gd-datepanel-navtext" @click="viewType='month'">{{viewDate.getRealMonth()}}月</span>
            <i class="icon-right gd-datepanel-navbtn" @click="nextMonth"></i>
            <i class="icon-next gd-datepanel-navbtn" @click="nextYear"></i>
        </div>
        <div class="gd-datepanel-daybox" v-if="viewType==='day'">
            <span class="gd-datepanel-daylabel" v-for="text,i in ['日','一','二','三','四','五','六']">{{text}}</span>
            <span class="gd-datepanel-day" :disabled="!isInRange(d)" :month="d.getRealMonth()" @click="daySelect(d)" :class="{'gd-day-inmonth':d.getRealMonth() === viewDate.getRealMonth(),'gd-date-active':d.getFullYear() === date.year && d.getRealMonth() === date.month && d.getDate() === date.day,'gd-date-between':isHighLigh(d)}" v-for="d in dayList">{{d.getDate()}}</span>
        </div>
        <div class="gd-datepanel-monthbox" v-if="viewType==='month'">
            <span class="gd-datepanel-month" @click="monthSelect(m)" :class="{'gd-date-active':m === date.month}" v-for="m in monthList">{{m}}月</span>
        </div>
        <div class="gd-datepanel-yearbox" v-if="viewType==='year'">
            <span class="gd-datepanel-year gd-text-xl" title="上一页" @click="prevYearPage">···</span>
            <span class="gd-datepanel-year" @click="yearSelect(y)" :class="{'gd-date-active':y === date.year}" v-for="y in yearList">{{y}}</span>
            <span class="gd-datepanel-year gd-text-xl" title="下一页" @click="nextYearPage">···</span>
        </div>
        <div class="gd-datepanel-timebox" v-if="config.timePicker">
            <gd-timeruler :config="timeRulerConfig"></gd-timeruler>
        </div>
        <div class="gd-date-footer" v-if="!range">
            <button class="gd-btn" @click="ok" :disabled="!dateAvalible">确定</button>
            <button class="gd-btn-cancel" @click="cancel">取消</button>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        config: {
            default: {}
        },
        range: {
            default: false
        },
        startDate: {
            default: ''
        },
        endDate: {
            default: ''
        }
    },
    data() {
        let startTime = '';
        let endTime = '';
        if (this.config.timePicker) {
            if (this.config.timeValue instanceof Array && this.config.timeValue.length == 2) {
                startTime = this.config.timeValue[0];
                endTime = this.config.timeValue[1];
            } else if (this.config.timeValue) {
                startTime = this.config.timeValue;
            }
        }
        return {
            viewDate: new Date(), //视图日期
            viewType: 'day', //视图类型,day,month,year
            yearList: [], //年列表
            monthList: 12, //月列表,这个比较固定，就是12个月
            dayList: [], //日列表
            date: {
                year: '', //选中的年
                month: '', //选中的月
                day: '' //选中的天
            },
            startTime: startTime, //起始时间
            endTime: endTime, //结束时间
            timeRulerConfig: {
                //时间标尺配置
                step: this.config.timeStep || 30, //设置间隔分钟数，可选，默认是30分钟
                value: this.config.timeValue || '', //设置初始时间,可选
                range: this.config.timeRange, //时间范围选择
                change: time => {
                    if (this.config.timeRange) {
                        this.startTime = time[0];
                        this.endTime = time[1];
                    } else {
                        this.startTime = time;
                    }
                    this.$emit('selectChange', this.dateStr);
                }
            }
        };
    },
    methods: {
        //上一月
        prevMonth() {
            this.date.day = '';
            this.viewDate = dateAddMonth(this.viewDate, -1);
            this.date.month = this.viewDate.getRealMonth();
            this.updateView();
        },
        //下一月
        nextMonth() {
            this.date.day = '';
            this.viewDate = dateAddMonth(this.viewDate, 1);
            this.date.month = this.viewDate.getRealMonth();
            this.updateView();
        },
        //上一年
        prevYear() {
            this.date.day = '';
            this.viewDate = dateAddYear(this.viewDate, -1);
            this.date.year = this.viewDate.getFullYear();
            this.updateView();
        },
        //下一年
        nextYear() {
            this.date.day = '';
            this.viewDate = dateAddYear(this.viewDate, 1);
            this.date.year = this.viewDate.getFullYear();
            this.updateView();
        },
        //年选择
        yearSelect(year) {
            let date = new Date(this.viewDate);
            date.setFullYear(year);
            this.viewDate = date;
            this.viewType = 'month';
            this.date.year = this.viewDate.getFullYear();
            this.updateView();
            this.$emit('selectChange', this.dateStr);
        },
        //月选择
        monthSelect(month) {
            let date = new Date(this.viewDate);
            date.setRealMonth(month);
            this.viewDate = date;
            this.viewType = 'day';
            this.date.month = this.viewDate.getRealMonth();
            this.updateView();
            this.$emit('selectChange', this.dateStr);
        },
        //日选择
        daySelect(day) {
            let date = new Date(day);
            if (!this.isInRange(date)) {
                return;
            }
            this.viewDate = date;
            this.date.day = this.viewDate.getDate();
            this.date.month = this.viewDate.getRealMonth();
            this.date.year = this.viewDate.getFullYear();
            this.$emit('selectChange', this.dateStr);
        },
        //上一页年份
        prevYearPage() {
            this.viewDate = dateAddYear(this.viewDate, -19);
            this.updateView();
        },
        //下一页年份
        nextYearPage() {
            this.viewDate = dateAddYear(this.viewDate, 19);
            this.updateView();
        },
        //确定
        ok() {
            let dateStr = this.dateStr.replace(/\//g, '-');
            if (typeof this.config.change === 'function') {
                typeof this.config.change(dateStr);
            }
            this.$emit('change', dateStr);
        },
        //取消
        cancel() {
            this.$emit('cancel');
        },
        //更新视图
        updateView() {
            let dayNum = 42;
            let dayList = [];
            let tempDate = new Date(this.viewDate);
            tempDate.setDate(1);
            let firstDay = tempDate.getDay();
            for (let day = 0 - firstDay; day <= 41 - firstDay; day++) {
                dayList.push(dateAddDay(tempDate, day));
            }
            this.dayList = dayList;
            let yearList = [];
            for (let year = -9; year <= 9; year++) {
                yearList.push(dateAddYear(this.viewDate, year).getFullYear());
            }
            this.yearList = yearList;
        },
        //应用选择的日期
        applyDate() {
            this.date.year = this.viewDate.getFullYear();
            this.date.month = this.viewDate.getRealMonth();
            this.date.day = this.viewDate.getDate();
        },
        //value赋值
        applyValue() {
            if (this.config.value) {
                let date = gd.newDate(this.config.value);
                if (gd.isDate(date)) {
                    this.viewDate = date;
                    this.applyDate();
                    if (this.config.timePicker) {
                        if ($.isArray(this.config.timeValue) && this.config.timeValue.length == 2) {
                            this.startTime = this.config.timeValue[0];
                            this.endTime = this.config.timeValue[1];
                        } else if (this.config.timeValue) {
                            this.startTime = this.config.timeValue;
                        }
                    }
                }
            }
            this.updateView();
        },
        //判断是否要高亮
        isHighLigh(date) {
            if (this.range) {
                if (this.dateStr && this.startDate) {
                    let startDate = getZeroDate(gd.newDate(this.startDate));
                    let endDate = getZeroDate(gd.newDate(this.dateStr));
                    if (gd.isDate(startDate) && gd.isDate(endDate)) {
                        endDate.setDate(endDate.getDate() + 1);
                        return date >= startDate && date < endDate;
                    }
                } else if (this.dateStr && this.endDate) {
                    let startDate = getZeroDate(gd.newDate(this.dateStr));
                    let endDate = getZeroDate(gd.newDate(this.endDate));
                    if (gd.isDate(startDate) && gd.isDate(endDate)) {
                        endDate.setDate(endDate.getDate() + 1);
                        return date >= startDate && date < endDate;
                    }
                }
                return false;
            } else {
                return false;
            }
        },
        //判断日期是否在范围内
        isInRange(date) {
            let minDate = gd.newDate(this.config.minDate || '');
            let maxDate = gd.newDate(this.config.maxDate || '');
            let startDate = gd.newDate(this.startDate);
            let endDate = gd.newDate(this.endDate);
            let flagDate = '';
            if (gd.isDate(startDate)) {
                startDate = getZeroDate(startDate);
            }
            if (gd.isDate(endDate)) {
                endDate = getZeroDate(endDate);
            }
            if (gd.isDate(minDate)) {
                minDate = getZeroDate(minDate);
                if (date < minDate) {
                    return false;
                }
            }
            if (gd.isDate(maxDate)) {
                maxDate = getZeroDate(maxDate);
                maxDate.setDate(maxDate.getDate() + 1);
                if (date >= maxDate) {
                    return false;
                }
            }
            if (gd.isDate(minDate) && gd.isDate(startDate)) {
                if (minDate < startDate) {
                    minDate = startDate;
                }
                flagDate = minDate;
            } else if (gd.isDate(minDate)) {
                flagDate = minDate;
            } else if (gd.isDate(startDate)) {
                flagDate = startDate;
            }
            if (flagDate && date < flagDate) {
                return false;
            }
            flagDate = '';
            if (gd.isDate(maxDate) && gd.isDate(endDate)) {
                if (maxDate > endDate) {
                    maxDate = endDate;
                }
                flagDate = maxDate;
            } else if (gd.isDate(maxDate)) {
                flagDate = maxDate;
            } else if (gd.isDate(endDate)) {
                flagDate = endDate;
            }
            if (flagDate && date > flagDate) {
                return false;
            }
            return true;
        }
    },
    computed: {
        //选中日期的字符串形式
        dateStr() {
            let year = this.date.year;
            let month = this.date.month;
            let day = this.date.day;
            if (year === '' || month === '' || day === '') {
                return '';
            }
            month = gd.padLeft(month, 2);
            day = gd.padLeft(day, 2);
            if (this.config.timePicker) {
                if (this.config.timeRange) {
                    if (this.startTime == '' && this.endTime == '') {
                        return '';
                    } else {
                        let startStr = `${year}/${month}/${day} ${this.startTime}`;
                        let endStr = `${year}/${month}/${day} ${this.endTime}`;
                        return `${startStr} ~ ${endStr}`;
                    }
                } else {
                    if (this.startTime == '') {
                        return '';
                    } else {
                        return `${year}/${month}/${day} ${this.startTime}`;
                    }
                }
            } else {
                return `${year}/${month}/${day}`;
            }
        },
        //日期是否有效
        dateAvalible() {
            if (this.dateStr == '') {
                return false;
            }
            let minDate = '';
            let maxDate = '';
            if (this.config.minDate) {
                minDate = getZeroDate(gd.newDate(this.config.minDate));
            }
            if (this.config.maxDate) {
                maxDate = getZeroDate(gd.newDate(this.config.maxDate));
                maxDate.setDate(maxDate.getDate() + 1);
            }
            if (this.config.timePicker && this.config.timeRange) {
                let date = this.dateStr.split('~');
                let startDate = gd.newDate(date[0]);
                let endDate = gd.newDate(date[1]);
                if (gd.isDate(startDate) && gd.isDate(endDate)) {
                    if (minDate && maxDate) {
                        return startDate >= minDate && startDate < maxDate && endDate >= minDate && endDate < maxDate;
                    } else if (minDate) {
                        return startDate >= minDate && endDate >= minDate;
                    } else if (maxDate) {
                        return startDate < maxDate && endDate < maxDate;
                    }
                    return true;
                }
            } else {
                let date = gd.newDate(this.dateStr);
                if (gd.isDate(date)) {
                    if (minDate && maxDate) {
                        return date >= minDate && date < maxDate;
                    } else if (minDate) {
                        return date >= minDate;
                    } else if (maxDate) {
                        return date < maxDate;
                    }
                    return true;
                }
            }
            return false;
        }
    },
    watch: {},
    mounted() {
        this.applyValue();
        this.date.year = this.viewDate.getFullYear();
        this.date.month = this.viewDate.getRealMonth();
    }
};
/**
 * 在原有日期基础上，增加天数，默认增加1天
 */
function dateAddDay(date, days) {
    if (days === undefined || days === '') {
        days = 1;
    }
    let dateNew = new Date(date);
    dateNew.setDate(dateNew.getDate() + days);
    return dateNew;
}
/**
 * 在原有日期基础上，增加月数，默认增加1月
 */
function dateAddMonth(date, months) {
    if (months === undefined || months === '') {
        months = 1;
    }
    let dateNew = new Date(date);
    dateNew.setMonth(dateNew.getMonth() + months);
    return dateNew;
}
/**
 * 在原有日期基础上，增加年数，默认增加1年
 */
function dateAddYear(date, years) {
    if (years === undefined || years === '') {
        years = 1;
    }
    let dateNew = new Date(date);
    dateNew.setFullYear(dateNew.getFullYear() + years);
    return dateNew;
}
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