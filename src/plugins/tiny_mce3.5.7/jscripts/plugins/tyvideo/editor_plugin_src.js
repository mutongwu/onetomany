/**
 * editor_plugin_src.js
 *
 * @author wushufeng
 * @date 2012-11-20
 */ 
 (function () {
    // 装载语言包
    //tinymce.PluginManager.requireLangPack('typicupload');
    tinymce.create('tinymce.plugins.TYVideo', {
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
            
            // 注册tyVideo命令，使用tinyMCE.activeEditor.execCommand('tyVideo')激活此命令;
            ed.addCommand("tyVideo", function () {
                
               bk = ed.selection.getBookmark(1);
                
               var id = ed.id + "_" + "tyvideo";
               var el = jQuery("#" + id);
               var jqObj = jQuery("#" + ed.id);
               TY.loader('TY.ui.videoV2',function(){
                
                    //暴露接口，处理编辑区域的点击事件，关闭天涯的相关插件。
                    TY.ui.video.prototype.mceClosePlugin = function(){
                        this.hideUpload();
                        tinymce.plugins.TYVideo.tyVar = null;
                    };
                    
	                tinymce.plugins.TYVideo.tyVar = new TY.ui.video({
	                    el :  el.closest("td"),
	                    textarea :jqObj,
	                    callback:function(video){
				            if (video) {
                                
                                var html = ed.dom.createHTML('p', {},video['title']);
                                                                
				                var url = video['flashUrl'],
		                            data = {
		                                'type':'EmbeddedAudio',
		                                'width':'640',
		                                'height':'480',
		                                'params':{
                                                'src':url,'allowscriptaccess':'always',
                                                'quality':'high','wmode':'transparent',
                                                'type':'application/x-shockwave-flash'
                                         },
		                                'video':{
		                                    'sources':[]
		                                }
		                             };
		                        var value =  tinymce.util.JSON.serialize(data, "'");
                                html += ed.dom.createHTML('img', {
                                            "data-mce-src" : ed.baseURI.source + '/themes/advanced/img/trans.gif',
                                            "src" : ed.baseURI.source + '/themes/advanced/img/trans.gif',
                                            "class": "mceItemMedia mceItemEmbeddedAudio",
                                            'width':'640',
                                            'height':'480',
                                            "data-mce-json" : value
                                        });
                                        
                                bk && ed.selection.moveToBookmark(bk);
		                        ed.execCommand('mceInsertContent', false, html);
                                bk = null;
				            }
                        },
	                    top:2,
	                    left:-33
	                });
	             });
            });

            // 注册一个按钮
            ed.addButton('tyvideo', {
                title: '插入视频',
                cmd: 'tyVideo',
                'class': "video"
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
                longname: 'tyVideo',
                author: 'wushufeng',
                authorurl: 'http://www.tianya.cn',
                infourl: 'http://www.tianya.cn',
                version: "1.0"
            };
        }
    });

    // 注册插件
    tinymce.PluginManager.add('tyvideo', tinymce.plugins.TYVideo);
})();