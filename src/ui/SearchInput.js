/**
 * 
 *@description 给input元素，添加输入查询功能，显示查询提示。
 *@author wushufeng
 *@date 2013-11-06
 *   
 */
define(['core/Common','io/AjaxProxy'],function(Common){
    var $ = Common.jQuery;
    function SearchInput(cfg){
        $.extend(this,{
            rsLayer: null,
            preVal: null,
            val: null
        });
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
            script: false,
            
            //查询的值参数名
            queryKey: 'key',
            
            //查询的额外参数
            exParams:{},
            
            //返回值的数据属性
            dataProp: '',
            
            //符合该正则表达的字符，都将被过滤
            maskReg: null,
            
            //接收输入框的值，返回值作为输入框新的值
            maskFn: null,
            
            //启用简单的过滤：number/letter
            simpleMask:''
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
            this.rsLayer = $('<ul class="ui-schInput-layer"></ul>');
            var offset = this.config.el.offset();
            this.rsLayer.css({
                "position":"absolute",
                "display": "none",
                "top": offset.top + this.config.el.height() + 2,
                "left": offset.left
            }).appendTo(document.body);
        },
        
        doSearch: function(){
            var _this = this;
            this.config.exParams[this.config.queryKey] = this.value; 
            AjaxProxy.request({
                url: this.config.url,
                tfType : this.config.crossX ? 'script': 'json',
                dataType: 'json',
                data: this.config.exParams,
                success: function (json) {
                    _this.showRs(json);
                }
            });
        },
        
        showRs: function(json){
            var data = this.config.dataProp ? json[this.config.dataProp] : json;
            
        },
        
        
        navSearchRs: function(){            
        },
        
        bindEvents: function(){
            var _this = this;
            this.config.el.bind("keyup",function(e){
                
                if(e.which === 38 || e.which === 40){ //上下光标
                    _this.navSearchRs(e.which === 38 ? -1 : 1);
                }else{
                    if(_this.config.simpleMask === 'number'){
                        this.value = this.value.replace(/[^\d]/,'');
                    }else if(_this.config.simpleMask === 'letter'){
                        this.value = this.value.replace(/[^a-zA-Z]/,'');
                    }
                    if(typeof _this.config.maskReg === "objeck" && _this.config.maskReg.exec){
                        this.value = this.value.replace(_this.config.maskReg,'');
                    }
                    if(typeof _this.config.maskFn === "function"){
                        this.value = _this.config.maskFn(this.value);
                    }
                    if(this.value !== _this.preVal){
                        _this.preVal = this.value;
                        _this.doSearch();
                    }
                    
                }
                
            });
        }
        
    };
    
    return  SearchInput;
});