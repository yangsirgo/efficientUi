

/**
 * 自定义指令 在元素外部点击 触发相应事件
 * 使用：v-clickoutside="handleClose"
 */
export default {
    bind (el, binding, vnode) {
        function documentHandler (e) {
            if (el.contains(e.target)) {
                return false;
            }
            if (binding.expression) {
                binding.value(e);
            }
        }
        el.__vueClickOutside__ = documentHandler;
        document.addEventListener('click', documentHandler);
    },
    update () {

    },
    unbind (el, binding) {
        document.removeEventListener('click', el.__vueClickOutside__);
        delete el.__vueClickOutside__;
    }
};