/**
 * 
 *@description 给input元素，添加输入查询功能，显示查询提示。
 *@author wushufeng
 *@date 2013-11-06
 *   
 */
define(['core/Common','util/BomHelper','io/AjaxProxy'],function(Common,BomHelper,AjaxProxy){
    
    BomHelper.loadCss("resources/css/searchInput.css");
    var $ = Common.jQuery;
    function SearchInput(cfg){
        if(this instanceof SearchInput === false){
            return new SearchInput(cfg);
        }
        $.extend(this,{
            domEl: null,
            preVal: null,
            value: null,
            config:{}
        },true);
        this.init(cfg);
    }
    SearchInput.prototype = {
        constructor: SearchInput,
        
        defaultCfg: {
            //输入框对象或ID
            el: null,
            
            //查询接口
            url: '',
            
            //scirpt格式获取数据，适用于跨域请求
            crossX: false,
            
            //查询的值参数名
            queryKey: 'key',
            
            //查询的额外参数
            exParams:{},
            
            //返回值的数据层级，默认为空，多个层级用.号连接。
            //例如：data.items，则数据的返回格式为： {data:{items:[...]},...}
            dataPath: '',

            //没有查询结果的提示
            emptyTxt: '没有找到符合的结果',
            
            //显示浮层的最大高度,例如：200px
            maxHeight: null,
            
            //查询结果数据条目的处理函数，返回值作为Li元素的html
            itemTplFn: null,
            
            //鼠标点击结果项或者是回车触发事件
            onItemSel: null,
            
            //鼠标滑过、上下光标选中结果项触发事件
            onItemActive: null,
            
            //符合该正则表达的字符，都将被过滤
            maskReg: null,
            
            //接收输入框的值，返回值作为输入框新的值
            maskFn: null,
            
            //启用简单的过滤：number/letter
            simpleMask:'',
                        
            //上下光标在结果集移动的函数
            onNavFn: null
        },
        initCfg: function(cfg){
            $.extend(this.config,this.defaultCfg,cfg);
            if(typeof this.config.el === "string"){
                this.config.el = $('#' + this.config.el);
            }
        },
        init: function(cfg){
            this.initCfg(cfg);
            if(this.config.el.size() === 0){
                return;
            }
            this.initDom();
            this.bindEvents();
        },
        
        initDom: function(){
            this.domEl = $('<div class="ui-schInput-layer"></div>');
            var offset = this.config.el.offset();
            this.domEl.css({
                "position":"absolute",
                "display": "none",
                "width": this.config.el.width(),
                "top": offset.top + this.config.el.outerHeight(),
                "left": offset.left
            }).appendTo(document.body);
        },
        
        doSearch: function(value){
            if(!value){
                return;
            }
            var _this = this;
            this.config.exParams[this.config.queryKey] = value; 
            AjaxProxy.request({
                url: this.config.url,
                tfType : this.config.crossX ? 'script': 'json',
                dataType: 'json',
                data: this.config.exParams,
                success: function(json){
                    _this.showRs(json);
                }
            });
        },
        
        showRs: function(json){
            var data = json, paths = null;
            if(this.config.dataPath){
                paths = this.config.dataPath.split('.');
                while(paths.length && data){
                    data = data[paths.shift()];
                }
            }    
            
            var html = '<ul class="ui-schInput-box" MAX-HEIGHT>',
                fn = this.config.itemTplFn;
            if(this.config.maxHeight){
                html = html.replace('MAX-HEIGHT',
                    'style="max-height:' + this.config.maxHeight + 
                    ';*height:' + this.config.maxHeight + 
                    ';overflow:auto"');
            }else{
                 html = html.replace('MAX-HEIGHT','');
            }
            if(data && data.length){
                $.each(data,function(i,item){
                    html += '<li class="ui-schInput-item '+(i === 0? 'active': '')+'">' + (fn ? fn(item) : '') + '</li>';
                });
            }else{
                html += '<li class="ui-schInput-empty">' + this.config.emptyTxt + '</li>';
            }
            html += '</ul>';
            this.domEl.html(html).show();
            html = null;
        },
        
        /**
         *@description 上下移动光标 
         *@param {Number} 移动方向  。向上：-1，向下：1
         */
        navSearchRs: function(dir){
            var items = this.domEl.find('.ui-schInput-item'),
                size = items.size(),
                idx = items.filter(".active").index(),
                item = null;
            if(size && this.domEl.is(':visible')){
                idx = (idx + size + dir)%size;
                item = items.removeClass('active').eq(idx).addClass('active');
                if(this.config.maxHeight){
                    this.domEl.find('.ui-schInput-box')[0].scrollTop = 
                        Math.max(0,item.position().top + item.height());
                }
                if(typeof this.config.onItemActive === 'function'){
                    this.config.onItemActive.call(this,$(this),this);
                }
            }          
        },
        
        /**
         *@description 确定输入：回车或者是点击数据项
         *  */
        onComplete:function(){
            var actItem = this.domEl.find('.active');
            if(typeof this.config.onItemSel === 'function'){
                this.config.onItemSel.call(this,this.config.el,actItem,this);
            }
            this.domEl.hide();
        },
        bindEvents: function(){
            var _this = this;
            
            //用户键盘输入事件
            this.config.el.on("keyup",function(e){
                if(e.which === 38 || e.which === 40){ //上下光标
                    _this.navSearchRs(e.which === 38 ? -1 : 1);
                }else if(e.which === 13){ //回车
                    _this.onComplete();
                }else{
                    if(_this.config.simpleMask === 'number'){
                        this.value = this.value.replace(/[^\d]/g,'');
                    }else if(_this.config.simpleMask === 'letter'){
                        this.value = this.value.replace(/[^a-zA-Z]/g,'');
                    }
                    if(typeof _this.config.maskReg === "objeck" && _this.config.maskReg.exec){
                        this.value = this.value.replace(_this.config.maskReg,'');
                    }
                    if(typeof _this.config.maskFn === "function"){
                        this.value = _this.config.maskFn(this.value);
                    }
                    if(this.value !== _this.preVal){
                        _this.value = _this.preVal = this.value;
                        _this.doSearch(this.value);
                    }
                    
                }
                
            });
            
            //鼠标滑动事件
            this.domEl.on({
                "mouseover":function(e){
                    $(this).addClass('active').siblings().removeClass('active');
                    if(typeof _this.config.onItemActive === 'function'){
                        _this.config.onItemActive.call(_this,$(this),_this);
                    }
                },
                "click": function(e){
                    _this.onComplete();
                }
            },'.ui-schInput-item');
            
            //点击页面其它地方，关闭弹层
            $(document.body).on('click',function(e){
                _this.domEl.hide();
            });
        }
        
    };
    
    return  SearchInput;
});