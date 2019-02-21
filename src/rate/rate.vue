<template>
    <div class="score-star-wrap" @mouseleave="starleave">
        <div :class="scoreStarCls(item)"
             v-for="item in starNum"
             @mouseover="starhover(item,$event)"
             @click="starClick(item,$event)">
            <template v-if="!showCharacter">
                <span type="half" class="score-star-half-content" v-if="allowHalf"></span>
            </template>
            <template v-else>
                <span class="rate-chart-content-first">
                    <template v-if="icon !== '' && customIcon !== ''">{{character}}</template>
                    <template v-else><i :class="iconCls"></i></template>
                </span>
                <span type="half" class="rate-chart-content-second">
                    <template v-if="icon !== '' && customIcon !== ''">{{character}}</template>
                    <template v-else><i type="half" :class="iconCls"></i></template>
                </span>
            </template>
        </div>
        <div v-if="showText" class="score-star-text">
            <slot>{{currentIndex}} 星</slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "rate",
        props:{
            count:{
                type:Number,
                default:5
            },
            value : {
                type:Number,
                default:0
            },
            allowHalf:{
                type:Boolean,
                default:false
            },
            disabled : {
                type:Boolean,
                default:false
            },
            clearable : {
                type:Boolean,
                default:false
            },
            character : {
                type:String,
                default:''
            },
            icon : {
                type:String,
                default:''
            },
            customIcon : {
                type:String,
                default:''
            },
            showText : {
                type:Boolean,
                default:false
            }
        },
        data () {
            return {
                starNum : this.count,
                hoverIndex: -1,
                currentIndex:this.value,
                isHalf: this.allowHalf && this.value.toString().indexOf('.') > -1,
                isHover:false
            }
        },
        watch : {
            value (val) {
                this.currentIndex = val;
            },
            currentIndex (val) {
                this.setHalf(val);
            }
        },
        methods : {
            showCharacter () {
                return this.character !== '' || this.icon !== '' || this.customIcon !== '';
            },
            setHalf (val) {
                this.isHalf = this.allowHalf && val.toString().indexOf('.') > -1;
            },
            starClick (item,event) {
                if(this.disabled) return;
                if (this.isHalf) item -= 0.5;
                if (this.clearable && Math.abs(item -this.currentIndex) < 0.01) {
                    item = 0;
                };
                this.currentIndex = item;
                this.$emit('input',item);
                this.$emit('on-change',item);
            },
            starhover (item,event) {
                if(this.disabled) return;
                const type = event.target.getAttribute('type') || false;
                if(type === 'half' && this.allowHalf) {
                    this.isHalf = true;
                } else {
                    this.isHalf = false;
                }
                this.hoverIndex = item;
                this.isHover = true;
            },
            scoreStarCls (item) {
                let isFull = false;
                let isHalfLast = false;
                let currentIdx = this.isHover ? this.hoverIndex : this.currentIndex;

                if(this.isHover) {//鼠标移入状态
                    if(item <= this.hoverIndex) {
                        isFull = true;
                    }
                } else {
                    if(this.currentIndex >= item) {
                        isFull = true;
                    }
                }


                if (this.isHover) {
                    isHalfLast = currentIdx === item;
                } else {
                    isHalfLast = Math.ceil(this.currentIndex) === item;
                }

                return [
                    {
                        'score-star':!this.showCharacter(),
                        'score-star-chart': this.showCharacter(),
                        'score-star-full':(isFull && !isHalfLast) || (isHalfLast && !this.isHalf),
                        'score-star-half': isHalfLast && this.isHalf
                    }
                ]
            },
            starleave (){
                this.hoverIndex = -1;
                this.isHover = false;
                this.setHalf(this.currentIndex);
            }
        },
        computed : {
            iconCls () {
                return {
                    [`${this.icon}`]:this.icon !== '',
                    [`${this.customIcon}`]:this.customIcon !== ''
                }
            },
        }
    }
</script>

<style lang="less" scoped>
    @import '../../dist/gdui/src/gd_variables';
    @import url(https://netdna.bootstrapcdn.com/font-awesome/3.2.1/css/font-awesome.css);

    .score-star-wrap {
        margin-top: 5px;
        margin-bottom: 5px;
        margin-left: 5px;
        cursor: default;
        font-size: 20px;
        display: inline-block;
        .score-star {
            display: inline-block;
            cursor: pointer;
            transition: all ease-in-out .3s;
            position: relative;
            margin-right: 5px;
            &:before {
                 content: '\f005';
                 font-family: FontAwesome;
                 color: @grayColor7;
            }
            &:hover {
                 transform: scale(1.1);
            }
        }

        .score-star-chart {//自定义字符chart
            display: inline-block;
            cursor: pointer;
            transition: all ease-in-out .3s;
            position: relative;
            margin-right: 5px;
            .rate-chart-content-first {
                color: @grayColor7;
            }
            .rate-chart-content-second {
                color: @grayColor7;
                width: 50%;
                display: inline-block;
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                overflow: hidden;
            }
            i {
                font-style: normal;
            }
            &:hover {
                transform: scale(1.1);
            }

        }
        .score-star-half-content {
            width: 50%;
            display: inline-block;
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            overflow: hidden;
            &:before {
                 content: '\f005';
                 font-family: FontAwesome;
             }
            color: transparent;
        }

        .score-star-half {
            color: @grayColor7;
            .score-star-half-content {
                &:before {
                    color: @warningColor;
                }
            }
            .rate-chart-content-first {
                color: @grayColor7;
            }
            .rate-chart-content-second {
                color: @warningColor;
            }
        }

        .score-star-full {
            &:before {
                color: @warningColor;
            }
            .rate-chart-content-first {
                color: @warningColor;
            }
            .rate-chart-content-second {
                color: transparent;
            }
            .score-star-half-content {
                &:before {
                    color: transparent;
                }
            }
        }

        .score-star-text {
            display: inline-block;
            font-size: 14px;
            margin-left: 12px;
            vertical-align: middle;
        }
    }
</style>