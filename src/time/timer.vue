
<template>
    <span class="timer-vue">{{ date }}</span>
</template>

<script>
    import Time from './time';
    export default {
        name: "timer",
        props: {
            time: {
                type: [Number, Date, String],
                required: true
            },
            type: {
                type: String,
                validator (value) {
                    return ['relative', 'date', 'datetime'].indexOf(value) > -1;
                },
                default: 'relative'
            },
            interval: {
                type: Number,
                default: 60
            },
            format : {
                type: String,
                default: 'yyyy-MM-dd hh:mm:ss'
            }
        },
        data () {
            return {
                date: ''
            };
        },
        methods: {
            setTime(){
                const type = typeof this.time;
                let time;
                if (type === 'number') {
                    const timestamp = this.time.toString().length > 10 ? this.time : this.time * 1000;
                    time = (new Date(timestamp)).getTime();
                } else if (type === 'object') {
                    time = this.time.getTime();
                } else if (type === 'string') {
                    time = (new Date(this.time)).getTime();
                }
                if (this.type === 'relative') {
                    this.date = Time(time);
                } else {
                    const date = new Date(this.time);
                    const year = date.getFullYear();
                    const month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
                    const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                    const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
                    const minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                    const second = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
                    if (this.type === 'datetime') {
                        // this.date = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
                        this.date = this.formatFn(this.format,year,month,day,hour,minute,second);
                    } else if (this.type === 'date') {
                        this.date = this.formatFn(this.format,year,month,day);
                        // this.date = `${year}-${month}-${day}`;
                    }
                }
            },
            formatFn(fmt,Year,Month,Date,Hours,Minutes,Seconds){
                var o = {
                    "M+" : Month || '', //月份
                    "d+" : Date || '', //日
                    "h+" : Hours || '', //小时
                    "H+" : Hours || '', //小时
                    "m+" : Minutes || '', //分
                    "s+" : Seconds || '', //秒
                    "q+" : Math.floor((Month+3)/3) || '', //季度
                    "S" : Seconds/1000  || ''//毫秒
                };
                var week = {
                    "0" : "/u65e5",
                    "1" : "/u4e00",
                    "2" : "/u4e8c",
                    "3" : "/u4e09",
                    "4" : "/u56db",
                    "5" : "/u4e94",
                    "6" : "/u516d"
                };
                if(/(y+)/.test(fmt)){
                    fmt=fmt.replace(RegExp.$1, (Year+"").substr(4 - RegExp.$1.length));
                }
                if(/(E+)/.test(fmt)){
                    fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
                }
                for(var k in o){
                    if(new RegExp("("+ k +")").test(fmt)){
                        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
                    }
                }
                return fmt;
            }
        },
        watch:{
            time(newValue,oldValue) {
                this.setTime();
            }
        },
        mounted () {
            this.setTime();
            this.timer = setInterval(() => {
                this.setTime();
            }, 1000 * this.interval);
        },
        beforeDestroy () {
            if (this.timer) clearInterval(this.timer);
        }
    }
</script>

<style scoped>

</style>