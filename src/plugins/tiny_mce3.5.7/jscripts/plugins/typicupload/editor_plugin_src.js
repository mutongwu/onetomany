/**
 * editor_plugin_src.js
 *
 * @author wushufeng
 * @date 2012-11-20
 */
 (function () {
    // 装载语言包
    //tinymce.PluginManager.requireLangPack('typicupload');
    tinymce.create('tinymce.plugins.TYPicUpload', {
        /**
         * 初始化插件, 插件创建后执行.
         * This call is done before the editor instance has finished it's initialization so use the onInit event
         * of the editor instance to intercept that event.
         *
         * @param {tinymce.Editor} ed Editor instance that the plugin is initialized in.
         * @param {string} url Absolute URL to where the plugin is located.
         */
        init: function (ed, url) {
             var bk = null;
             function insertPic(photos){
               if (photos) {
                    var tmp  = "";
                    for (var i=0,len=photos.length; i<len; i++) {

                        //Safari/Chrome下，天涯的图片会因盗链而被墙。
                        if(tinymce.isWebKit){
                            new Image().src = photos[i]['mid'];
                        }
                        tmp += ed.dom.createHTML('img', {
                            src : photos[i]['mid'],
                            alt : photos[i]['name'] || "",
                            style:"max-width:500px",
                            border : 0
                        });
                    }
                    bk && ed.selection.moveToBookmark(bk);
                    ed.execCommand('mceInsertContent', false, tmp);
                    bk = null;
                }
            }
            ed.addCommand("tyPicUpload", function () {
                
                bk = ed.selection.getBookmark(1);
                
                var id = ed.id + "_" + "typicupload",
                    el = jQuery("#" + id),
                    jqObj = jQuery("#" + ed.id);
                    
                TY.loader("TY.ui.photoV2",function(){
                    
                    //暴露接口，处理编辑区域的点击事件，关闭天涯的相关插件。
                    TY.ui.photo.prototype.mceClosePlugin = function(){
                        this.hide();
                        tinymce.plugins.TYPicUpload.tyVar = null;
                    };
                    //图片组件初始化
                    tinymce.plugins.TYPicUpload.tyVar = new TY.ui.photo({
	                    wrapContainer:jqObj,
	                    el: el,
	                    uploadPic:{callback:function(args){insertPic(args); }},
	                    newSociPic:{callback:function(args){insertPic(args); }},
	                    webPic:{callback:function(args){insertPic(args); }},
	                    noPreview:true,
	                    app:'blog',
	                    picNum:50,
	                    top:25,
	                    left:-35
	                });
                })
            });
            // 注册一个按钮
            ed.addButton('typicupload', {
                title: '插入图片',
                cmd: 'tyPicUpload',
                'class': 'photo'
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
                longname: 'tyPicUpload',
                author: 'wushufeng',
                authorurl: 'http://www.tianya.cn',
                infourl: 'http://www.tianya.cn',
                version: "1.0"
            };
        }
    });

    // 注册插件
    tinymce.PluginManager.add('typicupload', tinymce.plugins.TYPicUpload);
})();