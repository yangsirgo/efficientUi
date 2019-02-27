$(function(){
    initCode($('.exp_more')[0],'init');
    //点击代码部分 展现
    $('.exp_more').click(function (event) {
        initCode(event.target);
    })
})
function initCode(node,type) {

    var $parentNode = $(node).parents('.gd-row');
    var doucHeight = $parentNode.find('.demoExp').height();
    var codeHeight = $parentNode.find('.code-toolbar').height() + 20;

    if(type === 'init') {
        $parentNode.find('.demoExp1').css({
            height:doucHeight
        });
      if($(node).find('.icon-up').length!= 0){
            $(node).find('.icon-up').removeClass('icon-up').addClass('icon-down');
        } else if (node.tagName === 'I' && node.className != 'icon-down') {
              node.className = 'icon-down';
        }
    } else {
        if(node.className === 'icon-down' || $(node).find('.icon-down').length!= 0) {
            $parentNode.find('.demoExp1').css({
                height:codeHeight
            });
            if($(node).find('.icon-down').length!= 0){
                $(node).find('.icon-down').removeClass('icon-down').addClass('icon-up');
            } else if (node.tagName === 'I' && node.className != 'icon-up') {
                node.className = 'icon-up';
            }

        } else {
            $parentNode.find('.demoExp1').css({
                height:doucHeight
            });
            if($(node).find('.icon-up').length!= 0){
                $(node).find('.icon-up').removeClass('icon-up').addClass('icon-down');
            } else if (node.tagName === 'I' && node.className != 'icon-down') {
                node.className = 'icon-down';
            }
        }
    }
}