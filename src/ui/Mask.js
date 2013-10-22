/**
 * @author shawn
 * @example 
 *  new Mask({
 *      loading: true
 *  });
 */
define(['core/Template','util/BomHelper'],function(Template,BomHelper){

    BomHelper.loadCss("resources/css/maskBox.css");
    
    // 遮盖层计数，值不为0时候，body的overflow属性值为 hidden.为了处理多个遮盖层的问题。
    var ie6Hack = 0;
    function Mask(cfg){
        jQuery.extend(this,{
            config:{},
            /**
             * @public
             */
            domEl: null
        });
        this.init(cfg);
    }

    jQuery.extend(Mask.prototype,{
        defaultCfg: {
            zIndex:9000,
            
            el: null,
            
            //loading提示是否采用fixed定位,设置了el或者使用IE6无效 .
            fixed: true,
            
            //默认遮盖层会被重用，如果需要生成新的遮盖，请设置为false
            singleton: true,
            
            //显示加载中
            loading: true,

            //点击遮盖层关闭
            clkClose:false ,
            
            //加载中的提示文本
            msg: "正在加载数据,请稍后...",
            
            //是否需要手动调用mask方法显示遮盖层。默认为false，直接显示。
            lazy: false
        },
        
        
        init: function(config){
            jQuery.extend(this.config,this.defaultCfg);
            jQuery.extend(true,this.config,config);
            this.initDom();
            this.render();
            this.config.lazy ? null:this.mask();
            this.bindEvents();
        },
        
        render: function(){
            var domEl = jQuery('.ui_Mask_box');
            if(this.config.singleton === false || domEl.size() === 0){
                jQuery(document.body).append(this._html);
                domEl = jQuery('.ui_Mask_box');
            }
            this.domEl = domEl.eq(domEl.size() - 1);
            this.updateDocStyle(1);
            if(this.config.loading){
                this.loading();
            }
            this._html = null;
        },
        
        /**
         * @public 显示遮盖层
         */
        mask: function(){
            this.domEl.show();
        },
        /**
         * @public 关闭遮盖层
         */
        unMask: function(){
            this.config.singleton ? this.domEl.hide():this.domEl.remove();            
            this.updateDocStyle(-1);
        },
        
        /**
         * @public 设置内容 
         */
        html: function(html){
            this.domEl.find('.mask_container').html(html);
            return this;
        },
        
        /**
         * @public 显示为加载中提示
         */
        loading: function(){
            var msg = '<div class="loading_box opacity_bg" style="position:{position}"><p class="ui_loading">'+this.config.msg+'</p></div>';
            msg = msg.replace(/\{position\}/g,this.getPosition());
            this.html(msg);
        },
        
        getPosition: function(){
            if(this.config.el || BomHelper.isIE6 || !this.config.fixed){
                return "absolute";
            }else{
                return "fixed";
            }
        },
        updateDocStyle: function(val){
            if(BomHelper.isIE6 && !this.config.el){
                ie6Hack += val;
                document.documentElement.style.overflow = ie6Hack > 0 ?"hidden" : '';
            }
        },
        
        bindEvents: function(){
            var _this = this;
            if(this.config.clkClose === true){
                this.domEl.click(function(){
	                _this.unMask();
	            });
            }
            
        },
        initDom: function(){
            var content = '<div class="mask_layer" style="position:{position}"></div>'.replace(/\{position\}/,this.getPosition()),
                temp = '';
            
	        if(BomHelper.isIE6){
	            content = '<iframe class="sel_hack_iframe" frameborder="0" src="about:blank"></iframe>' + content;
	        }
            
            if(this.config.el){
                var pos = this.config.el.position();
                temp = new Template("position:absolute;top:{top}px;left:{left}px;width:{width}px;height:{height}px")
                        .apply({
                            top: pos.top,
                            left: pos.left,
                            width: this.config.el.outerWidth(),
                            height: this.config.el.outerHeight()
                        });
            }
            content = '<div class="ui_Mask_box" style="{style}">' + content +
                '<div class="mask_container"></div></div>';
           this._html = content.replace(/\{style\}/g,temp);
        }
    });
    return Mask;
});