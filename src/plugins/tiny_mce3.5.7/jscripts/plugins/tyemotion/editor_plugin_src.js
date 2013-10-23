/**
 * editor_plugin_src.js
 *
 * @author wushufeng
 * @date 2012-11-20
 */ 
 (function () {
    // 装载语言包
    //tinymce.PluginManager.requireLangPack('typicupload');
    tinymce.create('tinymce.plugins.TYEmotion', {
        /**
         * 初始化插件, 插件创建后执行.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init: function (ed, url) {
             
             ed.addCommand("tyEmotion", function () {
                var id = ed.id + "_" + "tyemotion",
                    el = jQuery("#" + id),
                    jqObj = jQuery("#" + ed.id);
                
                TY.loader('TY.ui.faceV2',function(){
                    //重写文本写入函数
                    TY.ui.Face.prototype.insertFace = function(name,url){
                        ed.execCommand('mceInsertContent', false, ed.dom.createHTML('img', {
	                            src : url,
	                            title : name,
	                            border : 0
	                        }));
                    };
                    
                    //暴露接口，处理编辑区域的点击事件，关闭天涯的相关插件。
                    TY.ui.Face.prototype.mceClosePlugin = function(){
                        this.emotboxHide();
                        tinymce.plugins.TYEmotion.tyVar = null;
                    };
                    tinymce.plugins.TYEmotion.tyVar = new TY.ui.Face({
                        textArea: jqObj,
                        el: el,
                        isClickHide:true,
                        left: -53,
                        top:30,
                        isArrow:true
                    });
                });
            });
            // 注册一个按钮
            ed.addButton('tyemotion', {
                title: '表情',
                cmd: 'tyEmotion',
                'class': "emotion"
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
                longname: 'tyEmotion',
                author: 'wushufeng',
                authorurl: 'http://www.tianya.cn',
                infourl: 'http://www.tianya.cn',
                version: "1.0"
            };
        }
    });

    // 注册插件
    tinymce.PluginManager.add('tyemotion', tinymce.plugins.TYEmotion);
})();