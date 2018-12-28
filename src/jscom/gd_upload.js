let hiddenUploadCls = '__hiddenUploadCls';
let UploadSubmitCls = '__UploadSubmitCls';
let iframeCls = '__fileIframeCls';
let formCls = '__formCls';
let iframeTimer = null;

export default function uploadAction(config) {
    var defaultConfig = {
        el: null,//元素
        url: null,//上传的地址
        data: {},//上传时附带的额外参数
        accept: null,//接受上传的类型
        field: 'file', //文件字段名
        methods: 'POST',
        auto: true,//选择文件自动上传
        bindAction: ''//指向一个按钮触发上传
    };

    if(typeof config.bindAction === 'undefined'  || config.bindAction == '') {
        config.auto = true;
    } else {
        config.auto = false;
    }
    let uploadConfig = {};
    $.extend(uploadConfig, defaultConfig, config);
    let fileElem = `<input type="file" hidden="" name=${uploadConfig.field} class=${hiddenUploadCls}>`;
    if(isIe && isIe < 10){
       initIE(uploadConfig,fileElem);
    } else {
        if(!$(uploadConfig.el).next().hasClass(hiddenUploadCls)) {
            $(uploadConfig.el).after(fileElem);
        }
    }

    bindEvent(uploadConfig);

}


function initIE (uploadConfig,fileElem){
    let $iframe = $(`<iframe class=${iframeCls} id="fileIframe_id" name="fileIframe" frameborder="0" style="width: 0;height: 0;overflow: hidden;"></iframe>`);
    let elemForm = `<form target="fileIframe" class=${formCls} enctype="multipart/form-data" action=${uploadConfig.url} target="fileIframe"></form>`;

    //插入iframe
    $('#fileIframe_id')[0] || $('body').append($iframe);

    if(!$(uploadConfig.el).next().hasClass(formCls)){//submit 和 file 文件dom 元素 插入form 表单中
        $(uploadConfig.el).after(fileElem);
        $(uploadConfig.el).next().wrap(elemForm);
        $(uploadConfig.el).next().append(`<input type="submit" class=${UploadSubmitCls} hidden />`);
    }

}

function sendFileDataFn(uploadConfig) {
    if(isIe && isIe < 10) {
        iframeSend(uploadConfig)
    } else {
        ajaxSend(uploadConfig)
    }

}

function ajaxSend(uploadConfig) {
    let formData = new FormData();
    let file = $(uploadConfig.el).next()[0].files[0];
    formData.append(uploadConfig.field, file);
    //提交文件
    $.ajax({
        url: uploadConfig.url,
        type: 'post',
        data: formData,
        contentType: false,
        processData: false,
        dataType: 'json',
        beforeSend: function() {
            // gd.showLoading('资源上传中,请稍后…');
        },
        success: function (res) {
            typeof uploadConfig.done === 'function' && uploadConfig.done(res);
        },
        error: function (res) {
            gd.showError('获取上传后的响应信息出现异常');
            typeof uploadConfig.error === 'function' && uploadConfig.error(res);
        }
    });
}

function iframeSend(uploadConfig) {
    let hiddenUploadDom = $(uploadConfig.el).next().find(`.${hiddenUploadCls}`);
    if(hiddenUploadDom.val() === '') return;
    $(uploadConfig.el).next().submit();//更换文件出发submit 事件
    clearInterval(iframeTimer);
    iframeTimer = setInterval(function () {
        let res, iframeBody = $(`.${iframeCls}`).contents().find('body');
        try {
            res = iframeBody.text();
        } catch(e) {
            gd.showError('获取上传后的响应信息出现异常');
            clearInterval(iframeTimer);
            if(uploadConfig.auto) {
                hiddenUploadDom.val('');
            }
        }
        if(res){
            clearInterval(iframeTimer);
            iframeBody.html('');
            done(res,uploadConfig);
        }
    },30);
}

function done(res,uploadConfig) {
    $(uploadConfig.el).next().find(`.${hiddenUploadCls}`).val('');
    if(typeof res !== 'object'){
        try {
            res = JSON.parse(res);
        } catch(e){
            res = {};
            typeof uploadConfig.error === 'function' && uploadConfig.error(res);
            return gd.showError('请对上传接口返回有效JSON');
        }
    }
    typeof uploadConfig.done === 'function' && uploadConfig.done(res);

}

function isIe() {
    return !!(window.ActiveXObject || "ActiveXObject"in window) && ((navigator.userAgent.toLowerCase().match(/msie\s(\d+)/) || [])[1] || "11")
}

function bindEvent(uploadConfig) {
    $(document).on('click', uploadConfig.el, (e) => {
        if(isIe && isIe < 10) {
            $(uploadConfig.el).next().find(`.${hiddenUploadCls}`).click();//触发文件夹选择弹出
        } else {
            $(uploadConfig.el).next().click();
        }
        return false;
    });

    var targetDom = null;
    if(isIe && isIe < 10) {
        targetDom = $(uploadConfig.el).next().find(`.${hiddenUploadCls}`);
    } else {
        targetDom = $(uploadConfig.el).next();
    }

    targetDom.change(function (e) {//更换文件事件
        let path = $(e.target).val();
        path = path.substr(path.lastIndexOf("\\") + 1);
        if($(uploadConfig.el)[0].tagName === 'INPUT' && $(uploadConfig.el)[0].type === 'text') {
            $(uploadConfig.el).val(path);
        }
        if(uploadConfig.auto) {
            if(uploadConfig.accept) {
                if(path.substr(path.lastIndexOf('.')) === uploadConfig.accept) {
                    sendFileDataFn(uploadConfig);
                } else {
                    gd.showError('上传文件格式不正确，请上传'+ uploadConfig.accept +'格式的文件！');
                }
            } else {
                sendFileDataFn(uploadConfig);
            }
        }
    });

    if(!uploadConfig.auto && uploadConfig.bindAction) {
        $(document).on('click',uploadConfig.bindAction, ()=>{
            if(uploadConfig.accept) {
                if(path.substr(path.lastIndexOf('.')) === uploadConfig.accept) {
                    sendFileDataFn(uploadConfig);
                } else {
                    gd.showError('上传文件格式不正确，请重新上传！');
                }
            } else {
                sendFileDataFn(uploadConfig);
            }
        })
    }
}

