/**
 * 
 * 
 */
 define(function(){
    
    function ImageZoom(cfg){
        this.init(cfg);
    }
    
    ImageZoom.prototype = {
        //记录小图的数据{w:宽,h:高,offset:位移}
        imageData: null,
        
        //记录缩放镜头的数据{w:宽,h:高,range:当前步长,pageX:鼠标X坐标,pageY:鼠标Y坐标}
        lensData: null,
        config: {
            targetCls: 'ui_imageZoom_target',   
            loadingCls : 'ui_imageZoom_loading',//大图加载中样式名
            opacity: 0.4,           //镜头的透明度
            bgColor: '#999933',     //镜头的背景
            enableRange: false,     //启用镜头缩放功能
            rangStep: 0.8,          //镜头缩放阶级步长
            zoomRange: [1,5],       //镜头缩放大小阶级,zoomRange[1]代表lens的初始值，线性递减,zoomRange[0] 代表的lens值为：
                                    // lens*Math.pow(rangStep,(zoomRange[1]-zoomRange[0]))
            
            lens:[100,100],         //镜头大小[WIDTH,HEIGHT]，要求与查看区域等比
            dims:[300,300],         //大图查看区域大小[WIDTH,HEIGHT]
            offset:[50,0],          //大图查看位置距离小图的偏移[X,Y]
            el: null,
            lUrl: null,             //大图地址
            cursor: 'move',         //鼠标样式
            zIndex: 99              //大图的zIndex值
        },
        
        initCfg: function(cfg){
            var _this = this;
            this.config = jQuery.extend({},this.config,cfg);
            
            jQuery(new Image()).attr("src",this.config.el.attr("src")).load(function(){
                _this.imageData = {
                    w: _this.config.el.width(),
                    h: _this.config.el.height(),
                    offset: _this.config.el.offset()
                };
            });
        },
        initDom: function(){
            this.config.el.addClass(this.config.targetCls);
            
            
            //大图显示窗口
            this.viewEl = jQuery('.ui_imageZoom_view').size() > 0 ? 
                jQuery('.ui_imageZoom_view'): 
                jQuery('<div class="ui_imageZoom_view"></div>');
            this.viewEl.css({
                'position':"absolute",
                'display': "none",
                'zIndex': this.config.zIndex,
                "overflow": "hidden",
                'width': this.config.dims[0],
                'height': this.config.dims[1]
            });
            this.viewEl.appendTo(document.body);
            
            //缩放窗口
            this.lensEl = jQuery('.ui_imageZoom_lens').size() > 0 ? 
                jQuery('.ui_imageZoom_lens'):
                jQuery('<div class="ui_imageZoom_lens"></div>');
            this.lensEl.css({
                'position':"absolute",
                'opacity': this.config.opacity,
                'backgroundColor':this.config.bgColor,
                'display': "none",
                'width': this.config.lens[0],
                'height': this.config.lens[1]
            });
            this.lensEl.appendTo(document.body);
            
            //图片遮盖层。由于mousemove事件不能很好传递，建立一个遮盖层在图片上，侦听该事件。
            this.maskEl = jQuery('.ui_imageZoom_mask').size() > 0 ?
                jQuery('.ui_imageZoom_mask'):
                jQuery('<div class="ui_imageZoom_mask"></div>');
                
            this.maskEl.css({
                'position':"absolute",
                'opacity':0,
                'backgroundColor':"#fff",
                'display': "none",
                "overflow": "hidden",
                "zIndex": this.config.zIndex,
                'cursor':this.config.cursor,
                'width': this.config.el.width(),
                'height': this.config.el.height()
            });
            this.maskEl.appendTo(document.body);
        },
        init: function(cfg){
            this.initCfg(cfg);
            this.initDom();
            this.bindEvents();
        },
        
        onMouseenter: function(){
            if(!this.imageData){return;}
	         this.maskEl.css({
                "display": "block",
                "width": this.imageData.w,
                "height": this.imageData.h,
                "top" : this.imageData.offset.top,
                "left": this.imageData.offset.left
            });
        },
        onMousemove: function(pageX,pageY){
            if(!this.imageData){return;}
            var offsetTop = this.imageData.offset.top,
                offsetLeft = this.imageData.offset.left,
                w = this.imageData.w,
                h = this.imageData.h,
                lensW = this.lensData.w,//this.config.lens[0],
                lensH = this.lensData.h;//this.config.lens[1];
            var x = pageX - offsetLeft - lensW / 2;
            var y = pageY - offsetTop - lensH / 2;
    
            if (x < 0) {
                x = 0;
            } else if (x > w - lensW) {
                x = w - lensW;
            }
            if (y < 0) {
                y = 0;
            } else if (y > h - lensH) {
                y = h - lensH;
            }
    
            this.lensEl.css({
                display:"block",
                top: offsetTop + y,
                left: offsetLeft + x
            });
            if(this.lensData){
                //缓存坐标，用于镜头缩放
                this.lensData.pageX = pageX;
                this.lensData.pageY = pageY;
            }
            
            this.showLarge(function(){
                var dimsW = this.config.dims[0],
                    dimsH = this.config.dims[1];       
                this.viewEl.children("img").css({
                    marginLeft: - dimsW*x/lensW,
                    marginTop: -dimsW*y/lensH,
                    width: dimsW*w/lensW,
                    height:dimsH*h/lensH
                }).end().show();
            });
        },
        
        resizeLens: function(delta){
            var range = this.lensData.range,
                dir = (delta <= -120)?  "out" :"in" ;
            if(dir === "out"){//缩小
                range++;
                if(range > this.config.zoomRange[1]){
                    return;
                }
                this.lensData.w = this.lensData.w /this.config.rangStep;
                this.lensData.h = this.lensData.h /this.config.rangStep;  
            }else{//放大
                range--;
                if(range < this.config.zoomRange[0]){
                    return;
                }
                this.lensData.w = this.lensData.w * this.config.rangStep;
                this.lensData.h = this.lensData.h * this.config.rangStep;  
            }
            this.lensData.range = range;

            //更改镜头大小
            this.lensEl.css({
                width: this.lensData.w,
                height: this.lensData.h
            });

            //触发镜头
            this.onMousemove(this.lensData.pageX,this.lensData.pageY);
        },
        
        showLarge: function(callback){
            var _this = this,
                lUrl = this.config.lUrl || this.config.el.attr("src");
            if(this.viewEl.attr("picStat") == 2){   //大图已加载
                callback.call(_this);
            }else if(!this.viewEl.attr("picStat")){ //未加载大图
                this.viewEl.attr("picStat",1)
                    .addClass(this.config.loadingCls)
                    .css({
                        "display": "block",
                        "left": _this.imageData.w + _this.imageData.offset.left + _this.config.offset[0],
                        "top": _this.imageData.offset.top + _this.config.offset[1]
                    });
                jQuery('<img/>').load(function(){
                    _this.viewEl.attr("picStat",2).removeClass(_this.config.loadingCls).html(this);
                    callback.call(_this);
                }).attr("src",lUrl);
                callback.call(_this);
            }
        },
        
        updateImage: function(url){
            this.viewEl.empty().removeAttr("picStat");
            this.config.lUrl = url;
            
            //重置镜头参数
            this.lensData = {
                w: this.config.lens[0],
                h: this.config.lens[1],
                range: this.config.zoomRange[1]
            };
            this.lensEl.css({
                width: this.lensData.w,
                height: this.lensData.h
            });
        },
        onMouseout: function(){
            this.lensEl.hide();
            this.viewEl.hide();
        },
        bindEvents: function(){
            var _this = this;
            
            this.config.el.one('mouseenter',function(){
                _this.onMouseenter();
            });
            
            this.maskEl.mousemove(function(e){
                _this.onMousemove(e.pageX,e.pageY);
            }).mouseout(function(){
                _this.onMouseout();
            });
            if(this.config.enableRange === true && this.config.zoomRange && 
                this.config.zoomRange[0] < this.config.zoomRange[1]){
                    
                this.lensData = {
                    w: this.config.lens[0],
                    h: this.config.lens[1],
                    range: this.config.zoomRange[1]
                };
                this.maskEl.bind('DOMMouseScroll mousewheel', function(e){
                    if (!e.detail && !e.wheelDelta){
                        e = e.originalEvent;
                    }
                    //delta returns +120 when wheel is scrolled up, -120 when scrolled down
                    var delta = e.detail? e.detail*(-120) : e.wheelDelta;
                    _this.resizeLens(delta);
                    e.preventDefault();
                });
            }
        }
        
    };
    
    return ImageZoom;
 });
