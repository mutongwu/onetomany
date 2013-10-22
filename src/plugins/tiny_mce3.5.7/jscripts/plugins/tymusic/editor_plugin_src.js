/**
 * editor_plugin_src.js
 *
 * @author wushufeng
 * @date 2012-11-20
 */
 (function () {
    // 装载语言包
    //tinymce.PluginManager.requireLangPack('typicupload');
    tinymce.create('tinymce.plugins.TYMusic', {
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
            
            ed.addCommand("tyMusic", function () {
                
                bk = ed.selection.getBookmark(1);
                
                var id = ed.id + "_" + "tymusic",
                    el = jQuery("#" + id),
                    jqObj = jQuery("#" + ed.id);
                 TY.loader('TY.ui.musicboxV2',function(){
                    function createPlayer(url,params){
                        var data = {
                            'type':params === null ? 'EmbeddedAudio':'flash',
                            'width':params === null ? 260:(params.width||403),
                            'height':params === null ? 39:(params.height||60),
                            'params':{
                                    'src':url,
                                    'allowscriptaccess':'always',
                                    'quality':'high','wmode':'transparent',
                                     'type':'application/x-shockwave-flash'
                                    },
                            'video':{
                                'sources':[]
                            }
                         };
                        if(params){
                            data.params.flashvars = 'autoStart=false&targetUrl=' + params.url;
                        }
                        var value =  tinymce.util.JSON.serialize(data, "'");
                        ed.execCommand('mceInsertContent', false, ed.dom.createHTML('img', {
                                    "data-mce-src" : ed.baseURI.source + '/themes/advanced/img/trans.gif',
                                    "src" : ed.baseURI.source + '/themes/advanced/img/trans.gif',
                                    "class": "mceItemMedia " + (params === null ?"mceItemEmbeddedAudio":"mceItemFlash"),
                                    'width':params === null ? 260: (params.width||403),
                                    'height':params === null ? 39: (params.height||60),
                                    "data-mce-json" : value
                                })
                        );
                    }
                    TY.ui.musicbox.prototype.musicSearchFn = function(jqEl) {
                        
                        bk && ed.selection.moveToBookmark(bk);
                        
                        createPlayer(jqEl.attr('widget'),null);
                        
			            this._hide();
                        bk = null;
			        };
                    
			        TY.ui.musicbox.prototype.musicUrlFn = function(data) {
                        
                        bk && ed.selection.moveToBookmark(bk);
                        
                        if(data.app === "xiami"){
                            createPlayer(data.widget,null);
                        }else{
                            createPlayer(data.widget,data);
                        }
			            this._hide();   
                        bk = null;
			        };
                    
                    
                    //暴露接口，处理编辑区域的点击事件，关闭天涯的相关插件。
                    TY.ui.musicbox.prototype.mceClosePlugin = function(){
                        this._hide();
                        tinymce.plugins.TYMusic.tyVar = null;
                    };
                    
                    tinymce.plugins.TYMusic.tyVar = new TY.ui.musicbox({
                        el: el.closest("td"),
                        showArea: jqObj,
                        top:6,
                        left: 0
                    });
                });
            });

            // 注册一个按钮
            ed.addButton('tymusic', {
                title: '插入音乐',
                cmd: 'tyMusic',
                'class': 'music'
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
                longname: 'tyMusic',
                author: 'wushufeng',
                authorurl: 'http://www.tianya.cn',
                infourl: 'http://www.tianya.cn',
                version: "1.0"
            };
        }
    });

    // 注册插件
    tinymce.PluginManager.add('tymusic', tinymce.plugins.TYMusic);
})();