<template>
    <div class="gd-pagination">
        <div class="gd-pagination-info" v-if="(curPage - 1) * length + realLength>0">{{(curPage - 1) * length + 1}}&nbsp;-&nbsp;{{(curPage - 1) * length + realLength}}&nbsp;/&nbsp;{{total}}</div>
        <div class="gd-pagination-page">
            <gd-select v-model="length" @change="changeLengthMenu" v-if="enableLengthMenu">
                <gd-option v-for="val in lengthMenu" :value="val" :key="val">{{val}}</gd-option>
            </gd-select>
            <div class="gd-pagination-page-list" v-if="pages.length>1">
                <span class="icon-previous" title="首页" @click="goFirstPage($event)" :disabled="curPage === 1"></span>
                <span class="icon-left" title="上一页" @click="goPrevPage($event)" :disabled="curPage === 1"></span>
                <span v-for="page in pages" v-text="page" @click="turnPage" :class="{ 'gd-pagination-page-cur': page === curPage }">
                </span>
                <span class="icon-right" title="下一页" @click="goNextPage($event)" :disabled="curPage === pages[pages.length-1]"></span>
                <span class="icon-next" title="尾页" @click="goLastPage($event)" :disabled="curPage === pages[pages.length-1]"></span>
            </div>
            <div class="gd-pagination-page-jump" v-if="typeof enableJumpPage !=='undefined' && enableJumpPage">
                <input type="text" class="gd-input" v-model.number="jumpPageVal" @keydown.enter="jumpPage">
                <button @click="jumpPage">GO</button>
            </div>
        </div>
    </div>
</template>
<script>
//默认配置数据
let defaultConfig = {
    length: 10, //每页多少条
    curPage: 1, //当前页码
    lengthMenu: [10, 30, 50, 100], //可选择每页多少条
    enableLengthMenu: true, //启用可选择每页多少条
    enableJumpPage: false, //启用跳页
    total: 0, //数据总量
    realLength: 0 //实际数据长度
};
let workConfig = {
    jumpPageVal: '', //跳页页码
    pages: [1, 2, 3] //页码列表
};
export default {
    props: ['config'],
    data() {
        let data = $.extend(true, {}, defaultConfig, this.config, workConfig);
        return $.extend(true, {}, defaultConfig, this.config, workConfig);
    },
    computed: {
        //总页码
        totalPage() {
            return Math.ceil(this.total / this.length);
        }
    },
    model: {},
    methods: {
        //改变页码
        turnPage(e) {
            this.curPage = Number(e.target.innerText);
        },
        //上一页
        goPrevPage(e) {
            if (!$(e.currentTarget).attr('disabled')) {
                this.curPage = Math.max(1, this.curPage - 1);
            }
        },
        //下一页
        goNextPage(e) {
            if (!$(e.currentTarget).attr('disabled')) {
                log(this.curPage);
                log(this.totalPage);
                this.curPage = Math.min(this.totalPage, this.curPage + 1);
            }
        },
        //首页
        goFirstPage(e) {
            if (!$(e.currentTarget).attr('disabled')) {
                this.curPage = 1;
            }
        },
        //尾页
        goLastPage(e) {
            if (!$(e.currentTarget).attr('disabled')) {
                this.curPage = this.totalPage;
            }
        },
        //跳页
        jumpPage(e) {
            this.curPage = this.jumpPageVal;
        },
        //调整每页显示条数
        changeLengthMenu(e) {
            if (this.curPage === 1) {
            } else {
                this.curPage = 1;
            }
            this.change();
        },
        //计算页码
        calcPages() {
            let pages = [];
            let i = 0;
            if (this.totalPage <= 5) {
                for (i = 1; i <= this.totalPage; i++) {
                    pages.push(i);
                }
            } else if (this.curPage <= 3) {
                for (i = 1; i <= 5; i++) {
                    pages.push(i);
                }
            } else if (this.curPage >= this.totalPage - 3) {
                for (i = this.totalPage - 4; i <= this.totalPage; i++) {
                    pages.push(i);
                }
            } else {
                for (i = this.curPage - 2; i <= this.curPage + 2; i++) {
                    pages.push(i);
                }
            }
            this.pages = pages;
        },
        //change事件
        change() {
            let data = {};
            data.length = Number(this.length);
            data.curPage = Number(this.curPage);
            this.calcPages();
            this.$emit('change', data);
        }
    },

    watch: {
        //页码变化触发事件
        curPage() {
            this.change();
        },
        //跳页
        jumpPageVal(newValue, oldValue) {
            if (isNaN(newValue)) {
                //输入的不是数字，置空
                this.jumpPageVal = '';
            } else if (newValue !== '' && newValue <= 0) {
                //小于等于0，改为第一页
                this.jumpPageVal = 1;
            } else if (newValue > this.totalPage) {
                //大于总页码，改为最后一页
                this.jumpPageVal = this.totalPage;
            }
        },
        //配置变化
        config: {
            deep: true,
            handler: function(val, oldVal) {
                for (var key in defaultConfig) {
                    if (this.config[key] !== undefined) {
                        this[key] = this.config[key];
                    }
                }
                this.calcPages();
            }
        }
    },
    mounted() {
        this.calcPages();
    }
};
</script>