/**
 * @description 右键菜单功能 
 * @author wushufeng
 * @date 2014-01-02
 *  
 */
define(['core/Base','core/Template','util/BomHelper'],function(Base,Template,BomHelper){
    var $ = jQuery;
    BomHelper.loadCss('resources/css/contextMenu.css');
    
    function ContextMenu(cfg){
        if(this instanceof ContextMenu === false){
            return new ContextMenu(cfg);
        }
        
        $.extend(this,{
            domEl: null,
            tpl: null,
            config:{}
        },true);
        this.init(cfg);
    }
    
    ContextMenu.prototype = {
        contructor: ContextMenu,
        
        defaultCfg: {
            //添加右键监听的jq对象或选择器
            el: '',
            
            /**
             * 菜单的宽度，超出不做隐藏 
             */
            minWidth: '100px',
            
            /**
             *菜单的显示层级 
             */
            zIndex: 100,
            
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
             * @property 自定义返回菜单的html结构。
             * 传递参数为激活事件的jq对象
             */
            customMenu: null,
            
                        
            /**
             * 菜单项选择器 ，用于事件绑定
             */
            itemSelector: '.ui-ctxMenu-item',
            
            /**
             *@property 菜单项的事件绑定 
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
            if(this.config.tpl){
                this.tpl = new Template(this.config.tpl);
            }
            if(!this.config.id){
                this.config.id = Base.id();
            }
        },
        init: function(cfg){
            this.initCfg(cfg); 
            this.initEvent();
        },
        
        createMenuItem: function(item,target){
            var valid = true , tpl = this.tpl;
            if(typeof this.config.beforeItemCreate === 'function'){
                valid = this.config.beforeItemCreate(item,target) === false ? false : true; 
            }
            return valid ? tpl.apply(item): '';
        },
        
        initDom: function(target){
            var _html = '', _this = this;
            if(!this.domEl){                
                this.domEl = $('<div id="'+this.config.id+'" class="ui-ctxMenu-box '+ this.config.cls+
                                '"><ul class="ui-ctxMenu-inner" style="min-width:'+ this.config.minWidth+
                                '"></ul></div>');
                this.domEl.appendTo(document.body);
                this.bindEvents(target);
            }
            if(typeof this.config.customMenu === 'function'){
                _html = this.config.customMenu.call(this,target);
            }else if(this.config.menu){
                $.each(this.config.menu,function(i,item){
                    _html += _this.createMenuItem(item,target);
                });
            }
            this.domEl.children('.ui-ctxMenu-inner').html(_html);
            //只允许一个右键菜单显示
            $('.ui-ctxMenu-box').hide();
        },
        
        hide: function(){
            // console.log(this)
            this.domEl.hide();
        },
        show: function(pos){
            this.domEl.css(pos[0]).children('.ui-ctxMenu-inner').css(pos[1]).end().show();
        },
        
        calculatePos: function(e){
            //作一次不可见的显示。用于计算内容宽高。
            this.domEl.css({'visibility':'hidden',"top":0,"left":0}).show();
            
            var offset = {},
                menu = this.domEl.children('.ui-ctxMenu-inner'),
                h = menu.height(),
                w = menu.width(),
                docSize = {
                    w: Math.max(document.documentElement.scrollWidth,document.documentElement.clientWidth),
                    h: Math.max(document.documentElement.scrollHeight,document.documentElement.clientHeight)
                };
            
            offset["top"] = (e.clientY + h > docSize.h) ? -h : 0;                
            offset["left"] = (e.clientX + w > docSize.w) ? -w : 0;

            return [{"top": e.clientY,"left": e.clientX,
                    "zIndex":this.config.zIndex,
                    "visibility":'visible'},
                    offset];
        },
        
        bindEvents: function(target){
            var _this = this, evMap = {};
            for(var p in this.config.events){
                if(typeof this.config.events[p] === 'function'){
                    evMap[p] = this.config.events[p];
                }
            }
            this.domEl.on(evMap,this.config.itemSelector,target);
            
            $(document.body).on('click',function(e){
                _this.hide();
            });
        },
        
        initEvent: function(){
            var _this = this;
            this.config.el.on('contextmenu', function(e) {
                    e.preventDefault();
                    _this.initDom($(e.target));
                    _this.show(_this.calculatePos(e));
                }
            );
        }
    };
    return ContextMenu;
});