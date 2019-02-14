
/***************************js组件******************************/
//全局js对象
function GD() {}
window.gd = new GD();
GD.prototype.successCode = 0; //resultCode===0表示成功

//表格
import Table from './Table.vue';
Vue.component('gd-table', Table);

//表格
import ToolBar from './ToolBar.vue';
Vue.component('gd-toolbar', ToolBar);

//下拉框
import Select from './select/Select.vue';
Vue.component('gd-select', Select);

//下拉框选项
import Option from './select/Option.vue';
Vue.component('gd-option', Option);

//悬浮窗
import { showHoverBox, closeHoverBox } from './jscom/gd_hoverbox.js';
GD.prototype.showHoverBox = showHoverBox;

//长传文件upload
import uploadAction from './jscom/gd_upload';
GD.prototype.upload = uploadAction;

//autoComplete
import autoComplete from './autoComplete.vue';
Vue.component('auto-complete', autoComplete);

//card 常用卡片
import Card from './card.vue';
Vue.component('gd-card', Card);

//步骤
import Steps from './steps/steps.vue';
Vue.component('Steps', Steps);


//步骤
import Step from './steps/step.vue';
Vue.component('Step', Step);

//时间
import Divider from './divider.vue';
Vue.component('gd-divider', Divider);

//折叠板
import Collapse from './collapse/Collapse.vue';
Vue.component('gd-collapse', Collapse);

//折叠板下的控制板
import Panel from './collapse/panel.vue';
Vue.component('gd-panel', Panel);

//时间
import Time from './time/timer.vue';
Vue.component('gd-time', Time);

//tab选项卡
import Tab from './tab/tab.vue';
Vue.component('gd-tab', Tab);

//选项卡内容
import TabItem from './tab/tab_item.vue';
Vue.component('gd-tab-item', TabItem);


//货币验证
import './jscom/currentValidate';




//工具方法
import {
    get,
    post,
    query,
    getMaxZIndex,
    toggleFullscreen,
    getBrowserInfo,
    clone,
    padLeft,
    newDate,
    isDate
} from './jscom/gd_tools.js';
GD.prototype.get = get; //get Ajax
GD.prototype.post = post; //post Ajax
GD.prototype.query = query; //获取url传参
GD.prototype.getMaxZIndex = getMaxZIndex; //获取页面中最大zIndex
GD.prototype.toggleFullscreen = toggleFullscreen; //切换全屏
GD.prototype.getBrowserInfo = getBrowserInfo; //获取浏览器信息
GD.prototype.clone = clone; //JSON数据的深复制
GD.prototype.padLeft = padLeft; //数字位数不足前面补0
GD.prototype.newDate = newDate; //创建日期对象
GD.prototype.isDate = isDate; //判断是否是有效日期

import { showTip, closeTip, showSuccess, showWarning, showError, showMsg, closeMsg } from './jscom/gd_msg.js';
GD.prototype.showTip = showTip; //显示tips信息
GD.prototype.closeTip = closeTip; //关闭tips信息
GD.prototype.showSuccess = showSuccess; //显示成功信息
GD.prototype.showWarning = showWarning; //显示警告信息
GD.prototype.showError = showError; //显示失败信息
GD.prototype.showMsg = showMsg; //显示普通信息
GD.prototype.closeMsg = closeMsg; //关闭信息

//表格对象
import { table } from './Table.vue';
GD.prototype.table = table;