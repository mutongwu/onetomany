define(['util/BomHelper'],function(BomHelper){
    BomHelper.loadCss("resources/css/atTA.css");
	function AtTA(cfg){
	    jQuery.extend(this,{
	         //浮动数据窗口已显示标识
	        flowActive: false,
            
            //静态数据窗口已显示标识
	        staticActive:false,
            
	        //光标记录
	        caretPos:{
	            atIdx : -1, //当前激活浮层的@符号在textarea的index位置
	            endIdx: 0  //当前激活浮层的光标在textarea的index位置
	        },
	        
	        //记录文本选择对象，IE使用
	        userRange: null,
	
	        //文本域对象
	        areaEl: null,
	        
	        //触发静态窗口jquery对象
	        el:null,
	        
	        //textarea的拷贝浮层
	        shadowSpan: null,
	        
	        //上一次查询的数据结果集
	        preDataCache: null, 
	        
	        //上一次查询的字符
	        preStr: ''
	    });
	    this.init(cfg);
	}
    (function(packager){
        jQuery.extend(packager.prototype,{
        
        //文档事件绑定标识
        docEventBind: false,
        
        //人物数据集
        data: null,
        
        //数据窗口
        listBox: null,
        
        defaultCfg: {
            
            //点击触发对象id
            el: null,
            
            //textarea的id
            areaEl: null,
            
            //监测textarea的输入
            bindTextarea: true
        },
        
        init: function(cfg){
            this.config = jQuery.extend({},this.defaultCfg,cfg);
            this.initDom();
            this.bindEvents();
        },
        loadData: function(callback){
            if(this.data){
                callback(this.data);
            }else{
                packager.prototype.data = [
                    '峨眉祈福迎新年',
                    '一千个刷华夏',
                    '秘密四十唯一',
                    '99元包邮',
                    '小心!与色狼同！',
                    '比打车还便宜的机票',
                    '移动工具管理员工'
                ];
                callback(this.data);
    //        jQuery.getJSON('XXX',function(rnt){
    //            if(rnt && rnt.success === 1){
    //                callback(rnt.data)
    //            }else{
    //                callback(rnt.data);
    //            }
    //        });   
            }
    
        },
        fillData: function(str){
            var _this = this;
            this.loadData(function(data){
                var _html = [];
                if(str !== "" && _this.preDataCache && str.indexOf(_this.preStr) !== -1){
                    data = _this.preDataCache;
                }
                _this.preDataCache = [];
                
                jQuery.each(data,function(i,item){
                    if(item.indexOf(str) !== -1){
                        _html.push('<li><a class="ui_atTA_item" href="javascript:void(0)">'+item+'</a></li>');
                        _this.preDataCache.push(item);
                    }
                });
                if(_html.length === 0){
                    _html.push("<p>按回车或空格选择</p>");
                }
                _this.listBox.find('.ui_atTA_cnt').html(_html.join(''));
                if(_this.listBox.find("a.on").size() === 0){
                    _this.listBox.find("a").eq(0).addClass("on");
                }
                _this.preStr = str;
            });
        },
        
        showStaticBox: function(t){
            
            var offset = t.offset();
            this.fillData("");
            this.listBox.addClass("ui_atTA_staticBox").css({
                top: offset.top + t.height(),
                left: offset.left
            }).show();
            this.staticActive = true;
        },
        hideStaticBox: function(){
            this.listBox.hide();
            this.staticActive = false;
        },
        
        hideFlowBox: function(){
            this.listBox.hide();
            this.flowActive = false;
        },
        showFlowBox: function(qStr){
            
            var areaEl = this.areaEl[0],
                scrollTop = areaEl.scrollTop;
            if(this.scrollHeight -  this.clientHeight> 0){
                this.shadowSpan.css("overflow-y","scroll");
            }else{
                this.shadowSpan.css("overflow-y","auto");
            }
            var objRectList = this.shadowSpan[0].getClientRects(),
                len = objRectList.length,
                rect = objRectList[len - 1];
            this.listBox.removeClass("ui_atTA_staticBox").css({
                top : rect.bottom - scrollTop,
                left : rect.right
            }).show();
            
            //填充数据
            this.fillData(qStr);
            
            this.flowActive = true;
        },
        
        initDom: function(){
            
            if(typeof this.config.areaEl === "string"){
                this.areaEl = jQuery("#" + this.config.areaEl);
            }else{
                this.areaEl = this.config.areaEl;
            }
            if(jQuery(document.body).children(".ui_atTA_listBox").size() === 0){
                this.listBox = jQuery('<div class="ui_atTA_listBox"><ul class="ui_atTA_cnt"><p class="loading">数据加载中...</p></ul></div>');
                jQuery(document.body).append(this.listBox);
            }else{
                this.listBox = jQuery(document.body).children(".ui_atTA_listBox");
            }
            
            if(this.config.el){
                if(typeof this.config.el === "string"){
                    this.el = jQuery("#" + this.config.el);
                }else if(typeof this.config.el === "object"){
                    this.el = this.config.el;
                }    
            }
            
            if(this.el){
                this.listBox.prepend('<input class="ui_atTA_input" type="text" maxlength="20" />');
            }
            //创建复制浮层
            if(this.config.bindTextarea){
                
                this.areaEl.addClass("ui_atTA_setCommonCss");
                var shadowBox = jQuery('<div class="ui_atTA_shadowBox ui_atTA_setCommonCss"><span class="ui_atTA_shadowSpan"></span></div>');
                
                jQuery(document.body).append(shadowBox);
                
                this.shadowSpan = shadowBox.children(".ui_atTA_shadowSpan");
                
                var offset = this.areaEl.offset();
                shadowBox.css({
                    width : this.areaEl.width(),
                    height : this.areaEl.height(),
                    top: offset.top,
                    left: offset.left
                });
            }
        },
        getCaret: function(textarea){
            var endIdx = 0;
            if ("selectionStart" in textarea) {
                if(textarea.selectionStart != textarea.selectionEnd){
                    return;
                }
                endIdx = textarea.selectionStart;
            } else {
                //由于textarea获得了焦点，document.selection相当于就是光标的范围
                //document.selection.createRange()就是长度为0的TextRange
                var userRange = document.selection.createRange();
                if(userRange.parentElement() === textarea){
                    //TODO 记录range对象
                    this.userRange = userRange;
                    
                    //创建一个文本区 createTextRange
                    var textRange = document.body.createTextRange();
                    //移动文本区到 textarea
                    //此时 textRange.text = this.value ,及textRange选区涵盖了 整个textarea
                    textRange.moveToElementText(textarea);
                    
                    //调整文本选区textRange的区域起点与userRange的区域起点重合 
                    var start = 0;
                    while(textRange.compareEndPoints('StartToStart',userRange) < 0 &&
                            textRange.moveStart('character',1)){
                        start++;
                    }
                    endIdx = start;
                }else{
                    return -1;
                }
            }
            return endIdx;
        },
        
        insertText: function(text){
            
            var val = this.areaEl.val(),
                beforeStr = val.substring(0,this.caretPos.atIdx+1),
                afterStr = val.substring(this.caretPos.endIdx);
            if(!this.flowActive && this.caretPos.atIdx === -1){
                beforeStr = val.substring(0,this.caretPos.endIdx) + "@";
    
                //更新光标位置
                this.caretPos.endIdx += (text+" ").length + 1;
            }    
            this.areaEl.val(beforeStr + text + " " +  afterStr);
            
            this.hideFlowBox();
            
            this.areaEl.focus();
            //设置光标新位置
            var caret = (beforeStr + text).length + 1;
            if ("setSelectionRange" in this.areaEl[0]) { //Chrome/Firefox/IE9+/Safari3+/Opera8+
                this.areaEl[0].setSelectionRange(caret, caret);
            }else{//IE6~8
                this.userRange.move("character",caret);
                this.userRange.select();
            }
        },
        bindEvents: function(){
            var _this = this,
                areaEl = this.areaEl;
            this.listBox.delegate(".ui_atTA_item",'hover',function(){
                _this.listBox.find(".ui_atTA_item").removeClass("on");
                jQuery(this).addClass("on");
            });
            this.listBox.delegate(".ui_atTA_item",'click',function(){
                if(_this.flowActive || _this.staticActive){
                    _this.insertText(jQuery(this).text());
                }
            });
            
            if(this.el){
                this.el.click(function(e){
                    _this.hideFlowBox();
                    _this.showStaticBox(jQuery(e.target));
                });
                
                //输入框事件
                var inputEl = this.listBox.find(".ui_atTA_input");
                if("onpropertychange" in inputEl[0]){
                    inputEl.bind("propertychange",function(){
                        _this.fillData(inputEl.val());
                    });
                }else if("oninput" in inputEl[0]){
                    inputEl.bind("input",function(){
                        _this.fillData(inputEl.val());
                    });
                }
                
                inputEl.bind("keydown",function(e){
                    //13-回车
                    if(e.which === 13){
                        e.preventDefault();
                        var text = _this.listBox.find("a.on").text();
                        _this.insertText(text);   
                    }
                    //38-向上；40-向下
                    if(e.which === 38 || e.which === 40){
                        e.preventDefault();
                        var arrowCmd = e.which === 38 ? -1 : 1;
                        var size = _this.listBox.find("a").size(),
                            curr = _this.listBox.find("a.on").parent().index();
                            
                        curr = (curr + arrowCmd + size)%size;
                        _this.listBox.find("a").removeClass("on").eq(curr).addClass("on");
                    }
                });
            }
            
            if(this.config.bindTextarea){
                var hideCommand = false,
                    arrowCmd = null;
                areaEl.bind("keydown",function(e){
                    //38-向上；40-向下
                    if((e.which === 38 || e.which === 40) && _this.flowActive ){
                        e.preventDefault();
                        arrowCmd = e.which === 38 ? -1 : 1;
                    }else{
                        arrowCmd = null;
                    }
                    
                    //13-回车；32-空格
                    if((e.which === 13 || e.which === 32) && _this.flowActive){
                        e.preventDefault();
                        hideCommand = true;
                    }else{
                        hideCommand = false;
                    }
                });
                
                areaEl.bind("keyup mouseup", function(e) {
                    var val = jQuery(this).val();
                    var endIdx = _this.getCaret(this);
                    
                    if(endIdx === -1){
                        return;
                    }
                    
                    var copyVal = val.substring(0,endIdx),
                        atIdx = copyVal.lastIndexOf("@",endIdx),
                        qStr = copyVal.substring(atIdx+1,endIdx),
                        activePos = false; //光标处于能够激活浮层的位置
                    
                    if(!/\s/.test(qStr) && atIdx !== -1){
                        copyVal = copyVal.substring(0,atIdx+1);
                        activePos = true;
                    }else{
                        qStr = '';
                        atIdx = -1; //这里重新设为-1，用于staicBox选择的光标判断。
                    }     
                    
                    //记录位置信息    
                    _this.caretPos.endIdx = endIdx;
                    _this.caretPos.atIdx = atIdx;
                    
                    _this.shadowSpan.html(copyVal.replace(/</g, '&lt;').replace(
                            />/g, '&gt;').replace(/\n/g, "<br/>"));
                    
                    var listBox = _this.listBox;
                    if(_this.flowActive){
                        //上下箭头移动
                        if(arrowCmd !== null){
                            var size = listBox.find("a").size(),
                                curr = listBox.find("a.on").parent().index();
                            
                            curr = (curr + arrowCmd + size)%size;
                            listBox.find("a").removeClass("on").eq(curr).addClass("on");
                            return;
                        }
                        
                        //回车或空格
                        if(hideCommand && e.type !== 'mouseup' && arrowCmd === null){
                            var text = listBox.find("a.on").text();
                            _this.insertText(text);    
                            return;
                        }
                        
                        if(!activePos){
                            _this.hideFlowBox();
                        }else{
                            _this.showFlowBox(qStr);
                        }
                    }else if(activePos){
                        _this.showFlowBox(qStr);
                    }
                    
                });
            }else{
                //不使用flowbox显示
                areaEl.bind("keyup mouseup", function() {
                    
                    var endIdx = _this.getCaret(this);
                    if(endIdx === -1){
                        return;
                    }
                    var copyVal = areaEl.val().substring(0,endIdx),
                        atIdx = copyVal.lastIndexOf("@",endIdx),
                        qStr = copyVal.substring(atIdx+1,endIdx);
                    if(/\s/.test(qStr)){
                        _this.caretPos.atIdx = -1;
                    }else{
                        _this.caretPos.atIdx = atIdx;
                    }
                    //记录位置信息    
                    _this.caretPos.endIdx = endIdx;
                    
                });
            }
            if(!packager.prototype.docEventBind){
                jQuery(document).click(function(e){
                    if( _this.areaEl[0] ===  e.target){
                        return false;
                    }else if(_this.el && 
                        (_this.el[0] === e.target || jQuery.contains(_this.el[0],e.target))){
                        return false;
                    }else if(jQuery.contains(_this.listBox[0],e.target)){
                        return false;
                    }
                    _this.flowActive && _this.hideFlowBox();
                    _this.staticActive && _this.hideStaticBox();
                });
                packager.prototype.docEventBind = true;
            }
        }
    });
    })(AtTA);
    return AtTA;
});