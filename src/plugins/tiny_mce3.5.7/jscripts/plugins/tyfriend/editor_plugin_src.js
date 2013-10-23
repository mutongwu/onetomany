/**
 * editor_plugin_src.js
 *
 * @author wushufeng
 * @date 2012-11-20
 */ 
 (function () {
    // 装载语言包
    //tinymce.PluginManager.requireLangPack('typicupload');
    tinymce.create('tinymce.plugins.TYFriend', {
        /**
         * 初始化插件, 插件创建后执行.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init: function (ed, url) {
            
             ed.addCommand("tyFriend", function () {
                var id = ed.id + "_" + "tyfriend",
                    el = jQuery("#" + id),
                    jqObj = jQuery("#" + ed.id);
           
                TY.loader('TY.ui.friendV2',function(){
                    //重写文本写入函数
                    TY.ui.friend.prototype.insertAtCursor = function(value,pos){
                        ed.execCommand('mceInsertContent', false, value);
                    };
                    
                    //暴露接口，处理编辑区域的点击事件，关闭天涯的相关插件。
                    TY.ui.friend.prototype.mceClosePlugin = function(){
                        this.remove();
                        tinymce.plugins.TYFriend.tyVar = null;
                    };
                    
                    tinymce.plugins.TYFriend.tyVar = new TY.ui.friend({
                        textArea: jqObj,
                        el: el,
                        isClickHide:true,
                        left: -3,
                        top:0,
                        isAutoTip:false
                    });
                });
            });
            // 注册一个按钮
            ed.addButton('tyfriend', {
                title: '@朋友',
                cmd: 'tyFriend',
                'class': "friend"
            });
        },

        /**
         * 以键/值数组格式返回插件信息
         * 下面有：longname, author, authorurl, infourl and version.
         *
         * @return {Object} Name/value array containing information about the plugin.
         */
        getInfo: function () {
            return {
                longname: 'tyFriend',
                author: 'wushufeng',
                authorurl: 'http://www.tianya.cn',
                infourl: 'http://www.tianya.cn',
                version: "1.0"
            };
        }
    });

    // 注册插件
    tinymce.PluginManager.add('tyfriend', tinymce.plugins.TYFriend);
})();