define(['util/BomHelper','io/AjaxProxy'],function(BomHelper,AjaxProxy){
    BomHelper.loadCss("resources/css/flowLayer.css");
    var userCardLayer = {
        layer: null,        //浮层父对象
        target: null,       //目标对象
        bOver: false,       //鼠标在目标对象之上
        mouseOnCard: false, //鼠标在浮层上方
        currKey: null,       //存放上一个用户的ID/name
        cacheData: null,    //存放上一个用户的数据
        layerTimer: null,   //浮层显示定时器
        mouseOutTimer: null, //离开目标对象，延迟关闭定时器
        
        config: {
            clsName: 'jsLayer', //目标class
            tfType: "json", //json/script
            
	        layerIndent: 15,//浮层相对目标的偏移
	        arrowLeft: 30, //箭头相对浮层的偏移
	        
	        //浮层的最大宽度
	        maxWidth: 350, 
	        //浮层的最大高度
	        maxHeight: 300,
	        //箭头的高度
	        arrowHeight: 6,
	        loadingText: '数据加载中...'
        },
        
        innerTpl : [
	                    '<div class="ui_flowLayerBox arrowTipBox">' ,
                           '<div class="ui_flowLayerCnt">',
                                '<p class="loading">',
                                '{loadingText}',
                                '</p>',
                            '</div>',
                            '<div class="arrow-direction arrowTipBox-up">',
	                        '   <em>◆</em><span>◆</span>',
	                        '</div>',
	                        '<div class="arrow-direction arrowTipBox-down">',
	                        '   <em>◆</em><span>◆</span>',
	                        '</div>',
	                        '<div class="arrow-direction arrowTipBox-left">',
	                        '   <em>◆</em><span>◆</span>',
	                        '</div>',
	                        '<div class="arrow-direction arrowTipBox-right">',
	                        '   <em>◆</em><span>◆</span>',
	                        '</div>',
	                    '</div>'
                ].join(''),
        init: function(args){
            jQuery.extend(true,this,args);
            this.layer = jQuery("#ui_flowLayerWrap");
            if(this.layer.size() === 0){
                jQuery(document.body).append('<div id="ui_flowLayerWrap"></div>');
                this.layer = jQuery("#ui_flowLayerWrap");
            }
            this.bindEvent();
        },
        
        calPosition: function(el){
            var pos = null , 
                winSize = {
                    w: Math.max(document.documentElement.scrollWidth,document.documentElement.clientWidth),
                    h: Math.max(document.documentElement.scrollHeight,document.documentElement.clientHeight)
                },
                
                elW = el.outerWidth(),
                elH = el.outerHeight(),
                arrow = {
                    dir: ".arrowTipBox-down",
                    left: this.config.arrowLeft
                },                
                
                //显示卡默认向左偏移15px
                result =  {
                    "bottom": this.config.arrowHeight,
                    "left": -this.config.layerIndent
                };
       
            pos = el.offset();
            
            //检测是否换行元素
            var objRectList = el[0].getClientRects();
            if(objRectList.length > 1){
                 if(this.eventObj.pageX > objRectList[1].right){
                    pos.left = objRectList[0].left;
                    
                    //重新计算宽度
                    elW = objRectList[0].width || (objRectList[0].right - objRectList[0].left);
                    elH = objRectList[0].height || (objRectList[0].bottom - objRectList[0].top);
                }else{
                    //鼠标在换行的文本上
                    pos.top = pos.top + elH/2 + 5; //补上大约5px的行高
                    //重新计算宽度
                    elW = objRectList[1].width || (objRectList[1].right - objRectList[1].left);
                    elH = objRectList[1].height || (objRectList[1].bottom - objRectList[1].top);
                }
                
            }
            //超出页面宽度
            if(pos.left + this.config.maxWidth > winSize.w){
                delete result.left;
                result.right = -elW - this.config.layerIndent;
                
                arrow.left = this.config.maxWidth - arrow.left;
            }
            // 浮层的最大高度约300px
            if(pos.top < this.config.maxHeight){
                delete result.bottom;
                
                //加上三角箭头高度
                result.top = elH  + this.config.arrowHeight;
                arrow.dir = ".arrowTipBox-up";
            }
            return [pos,result,arrow];
        },
        
        
        createDom: function(rnt){
            return rnt.toString();
        },
        initParams: function(key){
            return {key:key};
        },
        getKey: function(target){
            return target;
        },
        
        loadData: function(key){
            var _this = this;
            if(key === this.currKey){
                this.layer.find(".ui_flowLayerCnt").html(this.createDom(this.cacheData));
                return;
            }
            
            this.currKey = key;
            
            AjaxProxy.request({
                "url": this.config.url,
                "tfType": this.config.tfType,
                "cache": false,
                "data": this.initParams(key),
                "success": function(rnt){
                    _this.cacheData = rnt;
                    _this.layer.find(".ui_flowLayerCnt").html(_this.createDom(rnt));
                },
                "error": function(){
                    
                }
            });
        },
        
        showLayer: function(key){
            
            // 获取浮层显示位置
            var cssObj = this.calPosition(this.target,this.layer);
            
            this.layer.html(this.innerTpl.replace(/\{loadingText\}/,this.config.loadingText));
            this.layer.find(".ui_flowLayerBox").css(cssObj[1]);
            this.layer.css(cssObj[0]).show();
            this.layer.find(cssObj[2].dir).css("left",cssObj[2].left).show();
            //加载数据
            this.loadData(key);  
        },
        
        
        
        bindEvent: function(){
            var _this = this;
            this.layer.bind("mouseenter",function(event){
                _this.bOver = false;
                _this.mouseOnCard = true;
            }).bind("mouseleave",function(event){
                _this.bOver = false;
                _this.mouseOnCard = false;
                clearTimeout(_this.mouseOutTimer);
                _this.mouseOutTimer = null;
                if(!event.relatedTarget || event.relatedTarget.className.indexOf(_this.config.clsName) === -1){
                    _this.layer.empty().hide();
                }
            });
            
            
            jQuery("." + this.config.clsName).live("mouseenter",function(event){
                event.stopPropagation();
                if(_this.bOver){
                    return;
                }
                _this.bOver = true;
                _this.target = jQuery(this);
                _this.eventObj = event;
                
                if(_this.mouseOutTimer){
                    clearTimeout(_this.mouseOutTimer);
                    _this.mouseOutTimer = null;
                }
                if(!_this.layerTimer){
                    _this.layerTimer = setTimeout(function(){
                        clearTimeout(_this.layerTimer);
                        _this.layerTimer = null;
                        
                        if(!_this.bOver){return;}
                        var key = _this.getKey(_this.target);
                        if(!key){
                            return;
                        }
                        _this.showLayer(key);                       
                    },800);
                }
                
            }).live("mouseleave",function(event){
                event.stopPropagation();
                _this.bOver = false;
        
                if(_this.layer && jQuery.contains(_this.layer[0],event.relatedTarget) === false){
                    _this.mouseOutTimer = setTimeout(function(){
                        clearTimeout(_this.mouseOutTimer);
                        _this.mouseOutTimer = null;
                        
                        if(_this.mouseOnCard){
                            return;
                        }
                        _this.layer.empty().hide();
                        clearTimeout(_this.layerTimer);
                        _this.layerTimer = null; 
                    },150);
                }
            });
        }
    };
    return userCardLayer;
});