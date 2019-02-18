<template>
    <div class="gd-timeruler">
        <div class="gd-timeruler-bar" ref="timerulerBar" @click="barClick($event)">
            <div class="gd-timeruler-mark" @click.stop="" v-if="startMark!==-1" :style="{left:startMark-18+'px'}">
                <div class="gd-timeruler-mark-label">{{startTime}}</div>
                <div class="gd-timeruler-mark-trangle" @click.stop="" @mousedown.stop="mouseDown($event,'start')"></div>
            </div>
            <div class="gd-timeruler-mark" @click.stop="" v-if="endMark!==-1" :style="{left:endMark-18+'px'}">
                <div class="gd-timeruler-mark-label">{{endTime}}</div>
                <div class="gd-timeruler-mark-trangle" @click.stop="" @mousedown.stop="mouseDown($event,'end')"></div>
            </div>
            <div class="gd-timeruler-rangebar" v-if="startMark!==-1&&endMark!==-1" :style="{left:startMark+'px',right:'calc(100% - '+endMark+'px)'}"></div>
            <div class="gd-timeruler-labelbox">
                <div class="gd-timeruler-label" v-for="(label,index) in 7">{{index*4}}:00</div>
            </div>
            <div class="gd-timeruler-seg" v-for="s in segNum" :style="{width:segWidth}"></div>
        </div>
    </div>
</template>
<script>
let timeReg = /^(20|21|22|23|[0-1]\d)\:([0-5][0-9])(\:([0-5][0-9]))?$/; //时间点格式校验
export default {
    props: ['config'],
    data() {
        return {
            isMouseClick: false, //鼠标是否点击
            isMouseDown: false, //鼠标是否按下
            startX: 0, //鼠标起始点
            startMark: -1, //起始标记位置,当没有初始值时，startMark为-1
            startMarkOld: 0, //原起始标记位置
            endMark: -1, //结束标记位置,当没有初始值时，endMark为-1
            endMarkOld: 0, //原结束标记位置
            valueAvailable: false, //初始值是否有效
            moveType: 'start' //鼠标移动的是开始还是结束，start或end
        };
    },
    computed: {
        //分段数量
        segNum() {
            return Math.round((24 * 60) / (Number(this.config.step) || 30));
        },
        //每段长度
        segWidth() {
            return 100 / this.segNum + '%';
        },
        //起始时间
        startTime() {
            return this.getTimeByPosition(this.startMark);
        },
        //结束时间
        endTime() {
            return this.getTimeByPosition(this.endMark);
        }
    },
    methods: {
        //鼠标按下
        mouseDown(e, moveType) {
            this.moveType = moveType;
            $('body').addClass('gd-timeruler-move');
            this.startX = e.clientX;
            this.startMarkOld = this.startMark;
            this.endMarkOld = this.endMark;
            this.isMouseDown = true;
        },
        //标尺点击
        barClick(e) {
            this.isMouseClick = true;
            let barWidth = this.$refs.timerulerBar.offsetWidth;
            let barOffsetLeft = $(this.$refs.timerulerBar).offset().left;
            if (this.config.range === true) {
                let offset = e.clientX - barOffsetLeft;
                if (this.startMark === -1 && this.endMark === -1) {
                    this.startMark = 0;
                    this.endMark = offset;
                } else {
                    if (offset <= this.startMark) {
                        this.startMark = offset;
                    } else {
                        this.endMark = offset;
                    }
                }
            } else {
                this.startMark = e.clientX - barOffsetLeft;
            }
        },
        //通过位置计算时间
        getTimeByPosition(position) {
            if (this.$refs.timerulerBar) {
                let barWidth = this.$refs.timerulerBar.offsetWidth;
                let totalMinutes = (position / barWidth) * 24 * 60;
                let minutes = Math.round(totalMinutes % 60);
                let hours = Math.floor(totalMinutes / 60);
                minutes = Math.round(minutes / this.config.step) * this.config.step;
                hours += Math.floor(minutes / 60);
                minutes = minutes % 60;
                return gd.padLeft(hours, 2) + ':' + gd.padLeft(minutes, 2);
            } else {
                return '';
            }
        },
        //通过时间获取分钟数
        getTotalMinutesByTime(time) {
            time = time.split(':');
            return Number(time[0]) * 60 + Number(time[1]);
        },
        //通过时间计算位置
        getPositionByTime(time) {
            var result = timeReg.exec(time);
            if (result && this.$refs.timerulerBar) {
                let totalMinutes = Number(result[1]) * 60 + Number(result[2]);
                let barWidth = this.$refs.timerulerBar.offsetWidth;
                return (totalMinutes / (24 * 60)) * barWidth;
            } else {
                return -1;
            }
        },
        //设置时间范围
        setTimeRange(time) {
            if ($.isArray(time) && time.length == 2 && timeReg.test(time[0]) && timeReg.test(time[1])) {
                this.startMark = this.getPositionByTime(time[0]);
                this.endMark = this.getPositionByTime(time[1]);
            } else {
                this.startMark = -1;
                this.endMark = -1;
            }
        },
        //change事件
        change() {
            if (this.isMouseDown || this.isMouseClick) {
                if (this.config.range == true) {
                    this.config.value = [this.startTime, this.endTime];
                } else {
                    this.config.value = this.startTime;
                }
                this.$emit('change', this.config.value);
                if (typeof this.config.change === 'function') {
                    this.config.change(this.config.value);
                }
            }
            this.isMouseClick = false;
        }
    },
    watch: {
        //起始时间改变，触发change
        startTime() {
            this.change();
        },
        //结束时间改变，触发change
        endTime() {
            this.change();
        },
        //外部改变value
        'config.value'(val, oldVal) {
            if (this.config.range !== true) {
                if (this.startTime !== val) {
                    this.startMark = this.getPositionByTime(val);
                }
            } else if (this.startTime !== val[0] && this.endTime !== val[1]) {
                this.setTimeRange(val);
            }
        }
    },
    mounted() {
        let _this = this;
        //时间范围还是时间点
        if (this.config.range === true) {
            this.setTimeRange(this.config.value);
        } else {
            if (timeReg.test(this.config.value)) {
                this.startMark = this.getPositionByTime(this.config.value);
            }
        }
        $('body')
            //鼠标移动
            .on('mousemove', function(e) {
                if (_this.isMouseDown) {
                    let barWidth = _this.$refs.timerulerBar.offsetWidth;
                    if (_this.moveType === 'start') {
                        let startMark = e.clientX - _this.startX + _this.startMarkOld;
                        if (startMark < 0) {
                            _this.startMark = 0;
                        } else if (startMark >= barWidth) {
                            _this.startMark = barWidth;
                        } else if (_this.config.range === true && startMark >= _this.endMark) {
                            _this.startMark = _this.endMark;
                        } else {
                            _this.startMark = startMark;
                        }
                    } else {
                        let endMark = e.clientX - _this.startX + _this.endMarkOld;
                        if (endMark < 0) {
                            _this.endMark = 0;
                        } else if (endMark >= barWidth) {
                            _this.endMark = barWidth;
                        } else if (_this.config.range === true && endMark <= _this.startMark) {
                            _this.endMark = _this.startMark;
                        } else {
                            _this.endMark = endMark;
                        }
                    }
                }
            })
            //鼠标弹起，结束时间调整
            .on('mouseup', function() {
                _this.isMouseDown = false;
                $('body').removeClass('gd-timeruler-move');
            });
    }
};
</script>
