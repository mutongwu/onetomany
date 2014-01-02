/**
 * @description 右键菜单功能 
 * @author wushufeng
 * @date 2014-01-02
 *  
 */
define(['core/Template','util/BomHelper'],function(Template,BomHelper){
    var $ = jQuery;
    BomHelper.loadCss('resources/css/contextMenu.css');
    
    function ContextMenu(cfg){
        if(this instanceof ContextMenu === false){
            return new ContextMenu(cfg);
        }
        
        $.extend(this,{
            domEl: null,
            config:{}
        },true);
        this.init(cfg);
    }
    
    ContextMenu.prototype = {
        contructor: ContextMenu,
        
        defaultCfg: {
            //添加右键监听的jq对象或选择器
            el: '',
            
            //菜单项选择器 ，用于事件绑定
            itemSelector: '.ui-ctxMenu-item',
            
            /**
             *@property {Array} 菜单内容，每一个菜单项包括以下配置项：
             * {
             *     text: '', //显示名称,
             *     cls: '', //添加的样式className,默认有 add/edit/delete，多个cls用空格分隔.
             * }
             */
            menu:null,
            
            /**
             * @property 创建菜单项之前的处理函数，返回false则取消该菜单项的构建.
             * 传递参数为激活事件的菜单项数据、jq对象
             */
            beforeItemCreate: null,
            
             /**
             * @property 自定义返回菜单的html结构。menu/beforeItemCreate 配置将不起效。
             * 传递参数为激活事件的jq对象
             */
            createMenu: null,
            
            /**
             *@property 菜单项的事件监听 
             */
            events:{
                click: null,
                mouseenter: null,
                mouseout: null
            },
            
            /**
             *@property 自定义菜单容器的className 
             */
            cls: '',
            
            /**
             *@property 菜单项模板 
             */            
            tpl: '<li class="ui-ctxMenu-item {cls}">{text}</li>'
        },
        initCfg: function(cfg){
            $.extend(this.config,this.defaultCfg,cfg);
            if(typeof this.config.el === "string"){
                this.config.el = $(this.config.el);
            }
        },
        init: function(cfg){
            this.initCfg(cfg); 
            this.initEvent();
        },
        
        initDom: function(target){
            var _html = '', _this = this;
            if(!this.domEl){
                this.domEl = $('<ul class="ui-ctxMenu-box '+this.config.cls+'"></ul>');
                this.domEl.appendTo(document.body);
                this.bindEvents();
            }
            if(typeof this.config.createMenu === 'function'){
                _html = this.config.createMenu(target);
            }else if(this.config.menu){
                var valid = true , 
                    tpl =  new Template(this.config.tpl);
                $.each(this.config.menu,function(i,item){
                    if(typeof _this.config.beforeItemCreate === 'function'){
                        valid = !!_this.config.beforeItemCreate(item,target); 
                    }
                    if(valid){
                        _html += tpl.apply(item);;
                    }
                });
            }
            this.domEl.html(_html);
        },
        
        hide: function(){
            // console.log(this)
            this.domEl.hide();
        },
        show: function(pos){
            this.domEl.css(pos).show();
        },
        calculatePos: function(e){
            var top = 0, left = 0;
            top = e.clientY;
            left = e.clientX;
            return {
                "top": top,
                "left": left
            };
        },
        
        bindEvents: function(){
            var _this = this, evMap = {};
            for(var p in this.config.events){
                if(typeof this.config.events[p] === 'function'){
                    evMap[p] = this.config.events[p];
                }
            }
            this.domEl.on(evMap,this.config.itemSelector);
            
            $(document.body).on('click',function(e){
                _this.hide();
            });
        },
        
        initEvent: function(){
            var _this = this;
            this.config.el.on('contextmenu', function(e) {
                    _this.initDom($(e.target));
                    _this.show(_this.calculatePos(e));
                    e.preventDefault();
                }
            );
        }
    };
    return ContextMenu;
});