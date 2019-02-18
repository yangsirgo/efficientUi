<template>
    <div class="gd-login">
        <div class="gd-login-box">
            <div class="gd-login-logo-box" :style="{width:sliderWidth+'px'}">
                <div class="gd-login-logos" :style="{left:logoBoxOffset+'px'}">
                    <div v-for="prod,index in prods" class="gd-login-logoitem" :class="{'gd-login-logo-active':prod.isDefault}" @click="prodIndex=index">
                        <img :src="prod.logo">
                        <span v-if="prod.text" class="gd-login-prod-name" :style="prod.textStyle">{{prod.text}}</span>
                    </div>
                </div>
            </div>
            <form class="gd-login-form">
                <div class="gd-login-form-row">
                    <div class="gd-login-input" ref="userNameBox">
                        <i class="icon-user"></i>
                        <input type="text" autofocus class="gd-login-user" v-model="userName" ref="userName" @input="errorMsg = ''" @keyup.enter="submit($event)">
                        <i class="icon-close" v-if="userName" @click="clearUserName()"></i>
                    </div>
                </div>
                <div class="gd-login-form-row">
                    <div class="gd-login-input" ref="passwordBox">
                        <i class="icon-access"></i>
                        <input type="password" class="gd-login-password" ref="password" v-model="password" @input="errorMsg = ''" @keypress="checkCapsLock($event)" @keyup.enter="submit($event)" onpaste="return false" oncontextmenu="return false" oncopy="return false" oncut="return false">
                        <i class="icon-showpassword" v-if="password" @click="showPassword($event)"></i>
                    </div>
                </div>
                <div class="gd-login-form-row">
                    <button class="gd-login-submit" type="button" @click="submit($event)" ref="submitBtn">
                        <span class="gd-login-submit-text">登&nbsp;录</span>
                        <span class="gd-login-submit-bg" :class="{'gd-login-bg-move':isSubmiting}"></span>
                    </button>
                </div>
                <div class="gd-login-form-row">
                    <div class="gd-login-msg" v-if="errorMsg">{{errorMsg}}</div>
                </div>
            </form>
        </div>
        <div class="gd-login-cover-slider" :style="{minWidth:sliderWidth+'px'}">
            <div class="gd-login-cover-box" :style="{width:prods.length*100 + '%',left:-prodIndex*100 + '%'}">
                <div class="gd-login-cover-item" v-for="prod,index in prods" :style="{width:100/prods.length + '%'}">
                    <img :src="prod.cover">
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props: ["config"],
    data() {
        let sliderWidth = (this.config.length * 2 - 1) * 194;
        return {
            prods: this.config, //产品配置
            sliderWidth: sliderWidth, //logo滚动区宽度
            logoBoxOffset: sliderWidth / 2 - (this.config.length / 2) * 194, //logo偏移
            prodIndex: -1, //选择的产品索引
            userName: "", //用户名
            password: "", //密码
            errorMsg: "", //错误信息
            isSubmiting: false, //是否在提交数据中
            capLockTip: "" //大小写锁定提示
        };
    },
    methods: {
        //清空用户名
        clearUserName() {
            this.userName = "";
            this.$refs.userName.focus();
        },
        //显示密码
        showPassword(e) {
            let type =
                this.$refs.password.getAttribute("type") === "text"
                    ? "password"
                    : "text";
            this.$refs.password.setAttribute("type", type);
            $(e.target).toggleClass("icon-showpassword icon-hidden"); //区分明文和密文输入标识
        },
        //检查按键状态
        checkCapsLock(e) {
            //ie原生自带
            if (gd.getBrowserInfo().browser !== "ie") {
                let keyCode = e.keyCode || e.which;
                let isShift = e.shiftKey || keyCode == 16 || false;
                let c1 = keyCode >= 65 && keyCode <= 90 && !isShift; // Caps Lock 打开，且没有按住shift键
                let c2 = keyCode >= 97 && keyCode <= 122 && isShift; // Caps Lock 打开，且按住shift键
                let c3 = keyCode >= 65 && keyCode <= 90 && isShift; // Caps Lock 关闭，且按住shift键
                let c4 = keyCode >= 97 && keyCode <= 122 && !isShift; // Caps Lock 关闭，且没有按住shift键
                if (c1 || c2) {
                    if ($("#capslockTip").length === 0) {
                        this.capLockTip = gd.showTip(
                            e.currentTarget,
                            "大写锁定已打开",
                            {
                                id: "capslockTip",
                                time: 0
                            }
                        );
                    }
                } else if (c3 || c4) {
                    gd.closeTip(this.capLockTip);
                }
            }
        },
        //提交数据
        submit(e) {
            let _this = this;
            let display = $(_this.$refs.submitBtn).css("display");
            if (!display || display == "none") {
                return;
            }
            if (!_this.userName) {
                $(_this.$refs.userNameBox).addClass("gd-animate-shake");
                _this.$refs.userName.focus();
                setTimeout(function() {
                    $(_this.$refs.userNameBox).removeClass("gd-animate-shake");
                }, 1000);
                return;
            } else if (!_this.password) {
                $(_this.$refs.passwordBox).addClass("gd-animate-shake");
                _this.$refs.password.focus();
                setTimeout(function() {
                    $(_this.$refs.passwordBox).removeClass("gd-animate-shake");
                }, 1000);
                return;
            }
            let param = {
                userName: _this.userName,
                password: _this.password
            };
            if (typeof _this.prods[_this.prodIndex].encrypt === "function") {
                param = _this.prods[_this.prodIndex].encrypt(
                    param,
                    gd.clone(_this.prods[_this.prodIndex])
                );
            } else if (typeof sha256_digest === "function") {
                param.password = sha256_digest(param.password);
            }
            _this.isSubmiting = true;
            $.ajax({
                type: "post",
                url: _this.prods[_this.prodIndex].api,
                data: param,
                contentType:
                    typeof param === "string" ? "application/json" : undefined,
                dataType: "json",
                success: function(msg, status, xhr) {
                    if (
                        typeof _this.prods[_this.prodIndex].success ===
                        "function"
                    ) {
                        _this.prods[_this.prodIndex].success(
                            msg,
                            gd.clone(_this.prods[_this.prodIndex])
                        );
                    }
                    if (msg.resultCode === gd.successCode) {
                        if (_this.prods[_this.prodIndex].href) {
                            location.href = _this.prods[_this.prodIndex].href;
                        }
                    } else {
                        _this.errorMsg = msg.resultMsg;
                        _this.isSubmiting = false;
                        _this.$refs.userName.focus();
                    }
                },
                error: function(xhr, errorText, errorStatus) {
                    if (
                        typeof _this.prods[_this.prodIndex].error === "function"
                    ) {
                        _this.prods[_this.prodIndex].error(
                            xhr,
                            errorText,
                            errorStatus
                        );
                    }
                    _this.isSubmiting = false;
                    _this.errorMsg = errorStatus + " " + errorText;
                    _this.$refs.userName.focus();
                }
            });
        }
    },
    watch: {
        prodIndex() {
            this.logoBoxOffset =
                this.sliderWidth / 2 - (this.prodIndex + 0.5) * 194;
            this.prods.forEach((p, i) => {
                if (i === this.prodIndex) {
                    p.isDefault = true;
                } else {
                    p.isDefault = false;
                }
                Vue.set(this.prods, i, p);
            });
        }
    },
    mounted() {
        if (this.prods.length == 0) {
            return;
        }
        let _this = this;
        $.each(this.prods, (i, p) => {
            //有容错性，设置多个isDefault,以第一个为准
            if (p.isDefault && _this.prodIndex === -1) {
                _this.prodIndex = i;
            } else {
                p.isDefault = false;
            }
        });
        if (_this.prodIndex === -1) {
            //如果没有设置isDefault,取中间一个
            this.prodIndex = Math.ceil(this.prods.length / 2) - 1;
        }
    }
};
</script>