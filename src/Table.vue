<template>
    <div class="gd-table-wrapper" ref="tableWrapper">
        <div class="gd-table-scroll-h" ref="tableScrollH" :style="{height:'calc(100% - '+(scrollBarHWidth + (enablePaging?50:1))+'px)'}">
            <div class="gd-table-head" :style="{width:tableWidth=='100%'?tableWidth:tableWidth+pathWidth + scrollBarVWidth+'px',left:-scrollLeft+'px'}">
                <table>
                    <colgroup>
                        <col v-for="(col, colIdx) in columns" :width="columnWidth[colIdx]" v-if="col.show !== false">
                        <col :width="pathWidth + scrollBarVWidth+'px'" v-if="pathWidth + scrollBarVWidth > 0">
                    </colgroup>
                    <tr :class="{'gd-table-scrolled':scrollTop>0}">
                        <th v-for="(col, colIdx) in columns" v-if="col.show !== false" :style="{'text-align':col.align}" :col-index="colIdx" @mouseenter="headEnter(colIdx)" @mouseleave="headLeave(colIdx)">
                            <label v-if="col.type==='checkbox' && col.single!==true" class="gd-checkbox">
                                <input type="checkbox" v-model="checkdAll" @change="checkAllRows(colIdx)">
                                <i></i>
                            </label>
                            <span v-else class="gd-table-col-head" :class="{'gd-table-filter-head':filters[colIdx].keys !== undefined && filters[colIdx].keys.length > 0}" v-html="col.head"></span>
                            <div class="gd-table-order" @click="sort($event,col)" :class="{'gd-table-order-asc': orderColumn === col.name && orderType === 'asc','gd-table-order-desc': orderColumn === col.name && orderType === 'desc'}" v-if="col.orderable">
                                <i class="icon-ascending"></i>
                                <i class="icon-descending"></i>
                            </div>
                            <div class="gd-table-filter" :class="{'gd-table-filter-has':hasFilter(colIdx)}" v-if=" filters[colIdx].length > 0">
                                <i class="icon-down" @click="showFilters($event,colIdx)"></i>
                            </div>
                            <div class="gd-table-resize-proxy" v-if="columnResize" @mousedown.stop="resizeMouseDown($event,colIdx)">
                                <div class="gd-table-resize-line" v-if="colIdx === resizeIndex" :style="{height:resizeLineHeight+'px'}"></div>
                            </div>
                        </th>
                        <th v-if="pathWidth + scrollBarVWidth>0"></th>
                    </tr>
                </table>
            </div>
            <div class="gd-table-scroll-v" ref="tableBody">
                <div class="gd-table-body" :style="{width:tableWidth=='100%'?tableWidth:tableWidth+'px',left:-scrollLeft+'px'}" @scroll="bodyScroll($event)">
                    <table>
                        <colgroup>
                            <col v-for="(col, colIdx) in columns" :width="columnWidth[colIdx]" v-if="col.show !== false">
                        </colgroup>
                        <tr v-for="row,rowIdx in rows">
                            <td v-for="cell,colIdx in row" :class="[columns[colIdx].class]" :style="{'text-align':columns[colIdx].align}" v-if="columns[colIdx].show !== false">
                                <div v-if="columns[colIdx].operates" class="gd-table-operate">
                                    <button type="button" class="gd-table-operate-item gd-btn-alone" :disabled="operateDisabled[rowIdx][colIdx][i]" :style="{visibility:operateShow[rowIdx][colIdx][i]?'':'hidden'}" :class="operate.icon" :title="operate.title" v-for="operate,i in columns[colIdx].operates" v-if="i <= 1" @click="operateAction(operate,rowIdx,colIdx)"></button>
                                    <button type="button" class="gd-table-operate-item gd-btn-alone" :disabled="operateDisabled[rowIdx][colIdx][2]" :style="{visibility:operateShow[rowIdx][colIdx][2]?'':'hidden'}" :class="columns[colIdx].operates[2].icon" :title="columns[colIdx].operates[2].title" v-if="columns[colIdx].operates.length === 3" @click="operateAction(columns[colIdx].operates[2],rowIdx,colIdx)"></button>
                                    <button type="button" class="gd-table-operate-item icon-more gd-btn-alone" v-if="columns[colIdx].operates.length >= 4" @mouseenter="showMoreOperate($event,rowIdx,colIdx)"></button>
                                </div>
                                <label v-else-if="columns[colIdx].type==='checkbox'" class="gd-checkbox">
                                    <input type="checkbox" v-model="checkedRows[rowIdx]" @change="checkedChange(rowIdx,colIdx)" :disabled="disabledRows[rowIdx]">
                                    <i></i>
                                </label>
                                <div v-else v-html="cell" :class="{'gd-text-ellipsis':columns[colIdx].ellipsis!==false}" :title="getTitle(cell,row,rowIdx,colIdx)"></div>
                            </td>
                            <td :width="pathWidth+'px'" v-if="pathWidth>0"></td>
                        </tr>
                    </table>
                </div>
                <i class="gd-none-data" v-if="rows.length === 0"></i>
            </div>
        </div>
        <div class="gd-table-scroll-hp" @scroll.passive="scrollH($event)" ref="tableScrollHP">
            <div :style="{width:tableWidth+'px'}" class="gd-table-scroll-proxy"></div>
        </div>
        <div class="gd-table-footer" v-if="enablePaging">
            <div class="gd-table-info">{{total===0?0:(curPage - 1) * length + 1}}&nbsp;-&nbsp;{{(curPage - 1) * length + rows.length}}&nbsp;/&nbsp;{{total}}</div>
            <div class="gd-table-page">
                <gd-select v-model="length" @change="changeLengthMenu" v-if="enableLengthMenu">
                    <gd-option v-for="val in lengthMenu" :value="val" :key="val">{{val}}</gd-option>
                </gd-select>
                <div class="gd-table-page-list" v-if="curPage > 1 || pages.length > 1">
                    <span class="icon-previous" title="首页" @click="goFirstPage($event)" :disabled="curPage === 1"></span>
                    <span class="icon-left" title="上一页" @click="goPrevPage($event)" :disabled="curPage === 1"></span>
                    <span v-for="page in pages" v-text="page" @click="turnPage" :class="{ 'gd-table-page-cur': page === curPage }">
                    </span>
                    <span class="icon-right" title="下一页" @click="goNextPage($event)" :disabled="curPage === pages[pages.length-1]"></span>
                    <span class="icon-next" title="尾页" @click="goLastPage($event)" :disabled="curPage === pages[pages.length-1]"></span>
                </div>
                <div class="gd-table-page-jump" v-if="typeof enableJumpPage !=='undefined' && enableJumpPage">
                    <input type="text" class="gd-input" v-model.number="jumpPageVal" @keydown.enter="jumpPage">
                    <button @click="jumpPage">GO</button>
                </div>
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
import Bus from './bus.js';
let apps = []; //vue实例
let flag = false;
let loadingClass = 'gd-table-loading'; //loadingClass名称
export default {
    data() {
        //默认配置数据
        let config = {
            length: 50, //每页多少条
            curPage: 1, //当前页码
            lengthMenu: [10, 30, 50, 100], //可选择每页多少条
            enableLengthMenu: true, //启用可选择每页多少条
            enableJumpPage: false, //启用跳页
            enablePaging: true, //启用分页
            columnResize: true, //启用列宽调
            filtersShow: true, //显示高级检索
            orderType: 'desc', //排序规则
            showFooter: false, //显示footer
            lazy: false, //懒加载数据
            orderColumn: '', //排序列
            loading: false, //显示loading
            filterImmediately: false, //高级查询勾选后立即触发
            ajax: {
                type: 'get',
                url: '',
                data: {},
                dataType: 'json',
                contentType: 'application/json'
            }
        };
        //功能数据
        let workData = {
            columnWidth: [], //列宽
            columnOldWidth: [], //列宽备份
            isResizeModel: false, //进入列调整模式
            resizeIndex: -1, //列调整的索引
            startX: 0, //列宽调整鼠标起始位置
            endX: 0, //列宽调整鼠标结束位置
            tableWidth: '100%', //表格宽度
            resizeLineHeight: 40, //列宽调整线高度
            scrollBarVWidth: 0, //纵向滚动条宽度
            scrollBarHWidth: 0, //横向滚动条宽度
            total: 0, //数据总量
            jumpPageVal: '', //跳页页码
            pages: [], //页码列表
            rows: [], //数据值
            rawData: [], //原始数据
            checkedRows: [], //复选框选中的行
            disabledRows: [], //禁用的行
            checkdAll: false, //全选
            filters: [], //高级检索
            filterParam: {}, //检索参数
            customFilterParam: {}, //自定义检索参数
            isFirstLoad: true, //是否是第一次加载
            ajaxParam: {}, //ajax数据，这里是用户传过来的，不包含高级搜索
            operateShow: {}, //操作是否显示配置
            operateDisabled: {}, //操作是否禁用配置
            scrollTop: 0, //表格纵向滚动位置
            scrollLeft: 0, //表格横向向滚动位置
            pathWidth: 0 //列的宽度不能充满时，填充的宽度
        };
        if (typeof this.config.ajax.data === 'object') {
            workData.ajaxParam = gd.clone(this.config.ajax.data);
        }
        let data = $.extend(true, config, this.config, workData);
        if (this.config.lengthMenu instanceof Array) {
            data.lengthMenu = this.config.lengthMenu;
        }
        data.columns.forEach((o, i) => {
            //过滤器处理
            if (o.filters !== undefined) {
                let filter = '';
                if (o.filters instanceof Array) {
                    if (o.filters.length > 0) {
                        filter = o.filters.map(f => {
                            return {
                                label: f.label,
                                value: f.value,
                                checked: f.checked || false
                            };
                        });
                    }
                } else {
                    filter = o.filters;
                }
                if (filter) {
                    data.filters.push(filter);
                }
                delete o.filters;
            } else {
                data.filters.push({});
            }
        });
        return data;
    },
    props: ['config'],
    methods: {
        //加载数据
        loadData() {
            let _this = this;
            let tableWrapperObj = _this.$refs.tableWrapper; //获取table 对象 为loading做准备
            let param = {
                orderType: _this.orderType
            };
            if (_this.enablePaging) {
                param.start = (_this.curPage - 1) * _this.length;
                param.length = _this.length;
            }
            if (typeof _this.orderColumn !== '') {
                param.orderColumn = _this.orderColumn;
            }
            _this.ajax.data = $.extend(true, {}, _this.ajaxParam, param, this.filterParam);
            _this.ajax.success = function(msg, status, xhr) {
                // gd.closeLoading();
                $(tableWrapperObj).removeClass(loadingClass); //移除loading
                if (msg.resultCode === gd.successCode) {
                    _this.fillData(msg);
                } else {
                    gd.showError('数据加载失败！' + msg.resultMsg);
                }
            };
            _this.ajax.error = function(xhr, errorText, errorStatus) {
                // gd.closeLoading();
                $(tableWrapperObj).removeClass(loadingClass); //移除loading
                gd.showError('数据加载失败！' + errorStatus);
            };
            if (this.config.loading) {
                $(tableWrapperObj).addClass(loadingClass); //增加loading
                // gd.showLoading('数据加载中...');
            }
            $.ajax(this.ajax);
        },
        //计算列宽
        calcColumnWidth() {
            let _this = this;
            this.tableWidth = '100%';
            this.pathWidth = 0;
            this.scrollBarVWidth = 0;
            this.scrollBarHWidth = 0;
            _this.columnWidth.forEach((w, i) => {
                Vue.set(_this.columnWidth, i, _this.columns[i].width);
                _this.columnWidth[i] = _this.columns[i].width;
            });
            _this.$nextTick(() => {
                _this.scrollBarVWidth = _this.$refs.tableBody.offsetWidth - _this.$refs.tableBody.clientWidth;
                _this.$nextTick(() => {
                    let tempIdx = [];
                    $(_this.$refs.tableWrapper)
                        .find('.gd-table-head th[col-index]')
                        .each(function(i, el) {
                            tempIdx.push(Number($(el).attr('col-index')));
                            _this.columnWidth[$(el).attr('col-index')] = $(el).outerWidth();
                        });
                    _this.columnWidth.forEach((w, i) => {
                        if (typeof w === 'undefined' || tempIdx.indexOf(i) < 0) {
                            _this.columnWidth[i] = 0;
                        }
                    });
                    _this.columnOldWidth = [].concat(_this.columnWidth);
                    this.calcTableSize();
                });
            });
        },
        //计算表格大小
        calcTableSize() {
            let width = 0;
            this.columnWidth.forEach(w => {
                width += w;
            });
            this.tableWidth = width;
            this.scrollBarVWidth = this.$refs.tableBody.offsetWidth - this.$refs.tableBody.clientWidth;
            this.scrollBarHWidth = this.$refs.tableScrollHP.offsetHeight - this.$refs.tableScrollHP.clientHeight;
            this.pathWidth = Math.max(this.$refs.tableBody.offsetWidth - this.tableWidth, 0);
            this.$forceUpdate();
        },
        //填充表格数据
        fillData(msg) {
            let _this = this;
            _this.operateShow = {};
            _this.operateDisabled = {};
            _this.disabledRows = [];
            _this.checkedRows = [];
            _this.rawData = gd.clone(msg);
            if (typeof _this.ajax.dataSrc === 'function') {
                msg = _this.ajax.dataSrc(msg);
            }
            _this.total = msg.total;
            _this.rows = msg.rows;
            _this.columns.forEach(function(config, colIdx) {
                //render函数处理
                if (config.render !== undefined) {
                    _this.rows.forEach(function(row, rowIdx) {
                        row[colIdx] = config.render(row[colIdx], row, gd.clone(_this.rawData.rows[rowIdx]));
                    });
                }
                if (config.type === 'checkbox') {
                    //disabled函数处理
                    _this.rows.forEach(function(row, rowIdx) {
                        if (typeof config.disabled === 'function') {
                            _this.disabledRows[rowIdx] = config.disabled(
                                row[colIdx],
                                row,
                                gd.clone(_this.rawData.rows[rowIdx])
                            );
                        } else {
                            _this.disabledRows[rowIdx] = config.disabled == true;
                        }
                        //复选框
                        if (typeof config.checked === 'function') {
                            _this.checkedRows[rowIdx] = config.checked(
                                row[colIdx],
                                row,
                                gd.clone(_this.rawData.rows[rowIdx])
                            );
                        } else {
                            _this.checkedRows[rowIdx] = config.checked == true;
                        }
                    });
                }
            });
            //全选
            _this.checkdAll =
                _this.checkedRows.length > 0 &&
                _this.checkedRows.every(check => {
                    return check;
                });
            //操作配置
            let operateShow = {};
            let operateDisabled = {};
            _this.rows.forEach(function(row, rowIdx) {
                operateShow[rowIdx] = [];
                operateDisabled[rowIdx] = [];
                _this.columns.forEach(function(config, colIdx) {
                    operateShow[rowIdx][colIdx] = [];
                    operateDisabled[rowIdx][colIdx] = [];
                    if (config.operates !== undefined) {
                        config.operates.forEach(function(operate, opeIdx) {
                            let isShow = false;
                            let isDisabled = false;
                            //显示配置
                            if (typeof operate.show === 'function') {
                                isShow =
                                    operate.show(row[colIdx], gd.clone(row), gd.clone(_this.rawData.rows[rowIdx])) ===
                                    true;
                            } else {
                                isShow = operate.show !== false;
                            }
                            operateShow[rowIdx][colIdx].push(isShow);
                            //禁用配置
                            if (typeof operate.disabled === 'function') {
                                isDisabled =
                                    operate.disabled(
                                        row[colIdx],
                                        gd.clone(row),
                                        gd.clone(_this.rawData.rows[rowIdx])
                                    ) === true;
                            } else {
                                isDisabled = operate.disabled === true;
                            }
                            operateDisabled[rowIdx][colIdx].push(isDisabled);
                        });
                    }
                });
            });
            _this.operateShow = operateShow;
            _this.operateDisabled = operateDisabled;

            if (_this.enablePaging) {
                //页码配置
                _this.pages = [];
                let i = 0;
                if (_this.totalPage <= 5) {
                    for (i = 1; i <= _this.totalPage; i++) {
                        _this.pages.push(i);
                    }
                } else if (_this.curPage <= 3) {
                    for (i = 1; i <= 5; i++) {
                        _this.pages.push(i);
                    }
                } else if (_this.curPage >= _this.totalPage - 3) {
                    for (i = _this.totalPage - 4; i <= _this.totalPage; i++) {
                        _this.pages.push(i);
                    }
                } else {
                    for (i = _this.curPage - 2; i <= _this.curPage + 2; i++) {
                        _this.pages.push(i);
                    }
                }
            }

            //如果可调列宽第一次加载，要计算列宽
            if (_this.columnResize && _this.isFirstLoad) {
                _this.$nextTick(() => {
                    _this.calcColumnWidth();
                    _this.isFirstLoad = false;
                });
            }
        },
        //追加表格数据
        appendData(rows) {
            if (!this.enablePaging) {
                let msg = gd.clone(this.rawData);
                msg.rows = msg.rows.concat(rows);
                this.fillData(msg);
            }
        },
        //鼠标进入列头，显示列宽调整线
        headEnter(colIdx) {
            if (!this.isResizeModel) {
                this.resizeIndex = colIdx;
            }
        },
        //鼠标离开列头，隐藏列宽调整线
        headLeave(colIdx) {
            if (!this.isResizeModel) {
                this.resizeIndex = -1;
            }
        },
        //获取title
        getTitle(cell, row, rowIdx, colIdx) {
            if (typeof this.columns[colIdx].title === 'function') {
                return this.columns[colIdx].title(cell, gd.clone(row), gd.clone(this.rawData.rows[rowIdx]));
            } else if (this.columns[colIdx].title === true) {
                return cell;
            }
        },
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
            if (this.jumpPageVal && this.jumpPageVal > 0) {
                this.curPage = this.jumpPageVal;
            }
        },
        //调整每页显示条数
        changeLengthMenu(e) {
            if (this.curPage === 1) {
                this.loadData();
            } else {
                this.curPage = 1;
            }
        },
        //排序
        sort(e, col) {
            if (col.orderable) {
                if (this.orderColumn === col.name) {
                    this.orderType = this.orderType == 'asc' ? 'desc' : 'asc';
                } else {
                    this.orderColumn = col.name;
                }
                this.loadData();
            }
        },
        //列宽调整时鼠标按下
        resizeMouseDown(e, colIdx) {
            this.oldWidth = this.columns.map(function(obj) {
                return obj.width;
            });
            this.startX = this.endX = e.clientX;
            this.isResizeModel = true;
            this.resizeIndex = colIdx;
            this.resizeLineHeight = this.$refs.tableScrollH.clientHeight;
            $('body').addClass('gd-col-resize');
        },
        //显示高级搜索
        showFilters(e, colIdx) {
            if ($('.gd-table-filters-hoverbox').length) {
                return;
            }
            let _this = this;
            let hoverConfig = {
                el: e.currentTarget,
                checkbox: true, //显示复选框
                autoClose: false, //不自动关闭
                class: 'gd-table-filters-hoverbox'
            };
            if (_this.filters[colIdx] instanceof Array) {
                hoverConfig.items = _this.filters[colIdx].map(f => {
                    return {
                        text: f.label,
                        checked: f.checked
                    };
                });
                hoverConfig.onChange = function(data, full) {
                    if (_this.config.filterImmediately) {
                        _this.filters[colIdx].forEach((f, i) => {
                            f.checked = full[i].checked;
                        });
                        _this.filterChange();
                    }
                };
                hoverConfig.onClose = function(full) {
                    if (!_this.config.filterImmediately) {
                        _this.filters[colIdx].forEach((f, i) => {
                            f.checked = full[i].checked;
                        });
                        _this.filterChange();
                    }
                };
            } else {
                hoverConfig.content = $(_this.filters[colIdx]);
                hoverConfig.onClose = function(full) {
                    _this.filterChange();
                };
            }
            gd.showHoverBox(hoverConfig);
        },
        //获取高级查询参数
        getfilterParam() {
            let param = {};
            let filterParam = {};
            let _this = this;
            _this.filters.forEach((filter, i) => {
                if (
                    !(_this.columns[i].filterName === undefined && _this.columns[i].name === undefined) &&
                    _this.columns[i].show !== false
                ) {
                    param[_this.columns[i].filterName || _this.columns[i].name] = $(filter)
                        .map((i, k) => {
                            if (k.checked) {
                                return k.value;
                            }
                        })
                        .toArray();
                }
            });
            for (let key in param) {
                if (param[key].length > 0) {
                    filterParam[key] = param[key].join(';');
                }
            }
            $.extend(filterParam, this.customFilterParam);
            return filterParam;
        },
        //高级搜索
        filterChange() {
            let filterParam = this.getfilterParam();
            if (JSON.stringify(this.filterParam) !== JSON.stringify(filterParam)) {
                this.filterParam = filterParam;
                if (this.curPage == 1) {
                    this.loadData();
                } else {
                    this.curPage = 1;
                }
            }
        },
        //显示更多操作
        showMoreOperate(e, rowIdx, colIdx, i) {
            let _this = this;
            let currentTarget = e.currentTarget;
            $(currentTarget)
                .closest('tr')
                .addClass('gd-hover');
            gd.showHoverBox({
                el: e.currentTarget,
                position: 'left',
                //点击的时候触发
                onClick: function(data) {
                    _this.operateAction(_this.columns[colIdx].operates[data.index], rowIdx, colIdx);
                },
                items: $.map(_this.columns[colIdx].operates, (o, i) => {
                    if (i >= 2 && _this.operateShow[rowIdx][colIdx][i]) {
                        return {
                            text: o.text,
                            icon: o.icon,
                            disabled: _this.operateDisabled[rowIdx][colIdx][i],
                            index: i
                        };
                    }
                }),
                end: function(dom) {
                    $(currentTarget)
                        .closest('tr')
                        .removeClass('gd-hover');
                }
            });
        },
        //操作动作
        operateAction(operate, rowIdx, colIdx) {
            if (typeof operate.action === 'function') {
                let row = this.rows[rowIdx];
                let cell = row[colIdx];
                return operate.action(cell, gd.clone(row), gd.clone(this.rawData.rows[rowIdx]));
            }
        },
        //是否有更多操作
        hasMoreOperate(col, cell, row, rowIdx) {
            if (col.operates === undefined || col.operates.length === 0) {
                return false;
            } else {
                return col.operates.some((o, i) => {
                    if (o.show !== undefined) {
                        if (typeof o.show === 'function') {
                            return i >= 2 && o.show(cell, gd.clone(row), gd.clone(this.rawData.rows[rowIdx])) === true;
                        } else {
                            return i >= 2 && o.show;
                        }
                    } else {
                        return i >= 2;
                    }
                });
            }
        },
        //选中所有行
        checkAllRows(colIdx) {
            let _this = this;
            let checkedRows = this.checkedRows.map((c, i) => {
                return _this.checkdAll && _this.disabledRows[i] !== true;
            });
            if (JSON.stringify(checkedRows) !== JSON.stringify(this.checkedRows)) {
                this.checkedRows = checkedRows;
                if (typeof _this.columns[colIdx].change === 'function') {
                    let checkedData = this.rows.filter((row, i) => {
                        return this.checkedRows[i];
                    });
                    let checkedRawData = this.rawData.rows.filter((row, i) => {
                        return this.checkedRows[i];
                    });
                    _this.columns[colIdx].change(gd.clone(checkedData), gd.clone(checkedRawData));
                }
            }
        },
        //隐藏多列
        hideColumns(columns) {
            if (typeof columns === 'undefined' || !columns instanceof Array) {
                this.columns.forEach(col => {
                    col.show = false;
                });
            } else {
                this.columns.forEach(col => {
                    if (columns.indexOf(col.name) > -1) {
                        col.show = false;
                    } else {
                        col.show = true;
                    }
                });
            }
            this.calcColumnWidth();
            this.filterChange();
        },
        //隐藏单列
        hideColumn(column) {
            $.each(this.columns, (i, col) => {
                if (column === col.name) {
                    col.show = false;
                    this.calcColumnWidth();
                    this.filterChange();
                    return false;
                }
            });
        },
        //显示多列
        showColumns(columns) {
            if (typeof columns === 'undefined' || !columns instanceof Array) {
                this.columns.forEach(col => {
                    col.show = true;
                });
            } else {
                this.columns.forEach(col => {
                    if (columns.indexOf(col.name) > -1) {
                        col.show = true;
                    } else {
                        col.show = false;
                    }
                });
            }
            this.tableWidth = '100%';
            this.calcColumnWidth();
            this.filterChange();
        },
        //显示单列
        showColumn(column) {
            $.each(this.columns, (i, col) => {
                if (column === col.name) {
                    col.show = true;
                    this.calcColumnWidth();
                    this.filterChange();
                    return false;
                }
            });
        },
        //是否有勾选的查询条件
        hasFilter(colIdx) {
            let filterName = this.columns[colIdx].filterName || this.columns[colIdx].name;
            return this.filterParam[filterName] !== undefined && this.filterParam[filterName] !== '';
        },
        //列表滚动
        bodyScroll(e) {
            this.scrollTop = $(e.currentTarget).scrollTop();
        },
        //复选框改变
        checkedChange(rowIdx, colIdx) {
            let _this = this;
            if (_this.columns[colIdx].single === true) {
                let checkedRows = [];
                this.checkedRows.forEach((isChecked, i) => {
                    if (i === rowIdx) {
                        checkedRows.push(isChecked);
                    } else {
                        checkedRows.push(false);
                    }
                });
                this.checkedRows = checkedRows;
            } else {
                let checkAll = true;
                $.each(_this.checkedRows, (i, c) => {
                    if (!c && _this.disabledRows[i] !== true) {
                        checkAll = false;
                        return false;
                    }
                });
                _this.checkdAll = checkAll;
            }
            if (typeof _this.columns[colIdx].change === 'function') {
                let checkedData = this.rows.filter((row, i) => {
                    return this.checkedRows[i];
                });
                let checkedRawData = this.rawData.rows.filter((row, i) => {
                    return this.checkedRows[i];
                });
                _this.columns[colIdx].change(gd.clone(checkedData), gd.clone(checkedRawData));
            }
        },
        //横向滚动
        scrollH(e) {
            this.scrollLeft = e.currentTarget.scrollLeft;
        }
    },
    computed: {
        //总页码
        totalPage() {
            return Math.ceil(this.total / this.length);
        }
    },
    watch: {
        //页码变化加载数据
        curPage() {
            this.loadData();
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
        }
    },
    mounted() {
        let _this = this;
        //保存实例
        let tableIdx = -1;
        $.each(apps, (index, app) => {
            if (app.id === _this.id && app.id !== undefined) {
                tableIdx = index;
            }
        });
        if (tableIdx > -1) {
            apps.splice(tableIdx, 1, _this);
        } else {
            apps.push(_this);
        }
        _this.columnWidth = _this.columns.map(function(col) {
            return col.width;
        });
        this.columnOldWidth = [].concat(_this.columnWidth);
        //如果可调列宽，要监听窗口缩放
        $(window).resize(() => {
            _this.scrollBarVWidth = _this.$refs.tableBody.offsetWidth - _this.$refs.tableBody.clientWidth;
            if (this.columnResize) {
                _this.calcTableSize();
            }
        });
        $('body')
            //鼠标移动，调整列宽
            .on('mousemove', function(e) {
                if (_this.isResizeModel) {
                    _this.endX = e.clientX;
                    let offset = _this.endX - _this.startX;
                    let width = _this.columnOldWidth[_this.resizeIndex] + offset;
                    let minWidth = 90;
                    if (_this.columns[_this.resizeIndex].type === 'checkbox') {
                        minWidth = 40;
                    }
                    if (width < minWidth) {
                        Vue.set(_this.columnWidth, _this.resizeIndex, minWidth);
                    } else if (width > 2000) {
                        Vue.set(_this.columnWidth, _this.resizeIndex, 2000);
                    } else {
                        Vue.set(_this.columnWidth, _this.resizeIndex, width);
                    }
                    _this.resizeLineHeight = _this.$refs.tableScrollH.clientHeight;
                    _this.calcTableSize();
                }
            })
            //鼠标弹起，结束列宽调整
            .on('mouseup', function() {
                _this.columnOldWidth = [].concat(_this.columnWidth);
                _this.isResizeModel = false;
                _this.resizeLineHeight = 40;
                $('body').removeClass('gd-col-resize');
            });
        //加载数据
        this.filterParam = this.getfilterParam();
        if (!_this.lazy) {
            _this.loadData();
        }
        if (this.id !== undefined) {
            this.$refs.tableWrapper.id = this.id;
        }
    }
};
export function table(id) {
    let tableApp;
    $.each(apps, (i, app) => {
        if (app.id === id) {
            tableApp = new gdTable(id, i);
            return false;
        }
    });
    return tableApp;
}
function gdTable(id, index) {
    this.id = id;
    this.index = index;
}
//数据重新加载
gdTable.prototype.reload = function(resetPage, ajaxParam, isMerge) {
    if (resetPage) {
        apps[this.index].curPage = resetPage;
    }
    if (typeof ajaxParam === 'object') {
        if (isMerge === false) {
            apps[this.index].ajaxParam = gd.clone(ajaxParam);
        } else {
            apps[this.index].ajaxParam = $.extend(true, apps[this.index].ajaxParam, ajaxParam);
        }
    }
    apps[this.index].loadData();
};
//获取表格数据
gdTable.prototype.getData = function() {
    return gd.clone(apps[this.index].rows);
};
//获取选中的数据
gdTable.prototype.getCheckedData = function() {
    let checkedData = apps[this.index].rows.filter((row, i) => {
        return apps[this.index].checkedRows[i];
    });
    return gd.clone(checkedData);
};
//隐藏多列
gdTable.prototype.hideColumns = function(columns) {
    apps[this.index].hideColumns(columns);
};
//显示多列
gdTable.prototype.showColumns = function(columns) {
    apps[this.index].showColumns(columns);
};
//隐藏单列
gdTable.prototype.hideColumn = function(column) {
    apps[this.index].hideColumn(column);
};
//显示单列
gdTable.prototype.showColumn = function(column) {
    apps[this.index].showColumn(column);
};
//获取ajax参数
gdTable.prototype.getAjaxParam = function(isFull) {
    if (isFull) {
        return gd.clone(apps[this.index].ajax.data);
    } else {
        return gd.clone(apps[this.index].ajaxParam);
    }
};
//设置ajax参数
gdTable.prototype.setAjaxParam = function(ajaxParam, isMerge) {
    if (typeof ajaxParam === 'object') {
        if (isMerge === false) {
            apps[this.index].ajaxParam = gd.clone(ajaxParam);
        } else {
            apps[this.index].ajaxParam = $.extend(true, apps[this.index].ajaxParam, ajaxParam);
        }
    }
};
//设置高级查询参数
gdTable.prototype.setFilter = function(colName, filter) {
    let _this = this;
    $.each(apps[this.index].columns, (i, col) => {
        if (col.name !== undefined && col.name === colName) {
            if (filter instanceof Array) {
                let filterObj = filter.map(f => {
                    return {
                        label: f.label,
                        value: f.value,
                        checked: f.checked || false
                    };
                });
                Vue.set(apps[_this.index].filters, i, filterObj);
            } else {
                Vue.set(apps[_this.index].filters, i, filter);
            }
        }
    });
    apps[this.index].filterParam = apps[this.index].getfilterParam();
};
//设置高级查询值
gdTable.prototype.setFilterValue = function(filterName, filterValue) {
    if (typeof filterValue !== 'undefined') {
        apps[this.index].customFilterParam[filterName] = filterValue;
    } else {
        delete apps[this.index].customFilterParam[filterName];
    }
};
//设置排序
gdTable.prototype.setOrder = function(orderName, orderType) {
    if (typeof orderName !== 'undefined' && orderName) {
        apps[this.index].orderColumn = orderName;
    }
    if (typeof orderType !== 'undefined' && orderType) {
        apps[this.index].orderType = orderType;
    }
};
//追加数据
gdTable.prototype.appendData = function(rows) {
    if (rows instanceof Array) {
        apps[this.index].appendData(rows);
    }
};
</script>