define(function(){

    var AjaxProxy = {
        
        counter: 0,
        varKey: "var",

        //默认代理页面
        proxyUrl: 'http://shawn2.tianya.cn:5678/ajaxProxy.html',

        //默认代理iframe的id
        proxyId: 'ajaxProxy',
        
        getRandom: function(){
            return "ajaxProxy_" + this.counter++;
        },
        
        getScript: function(args){
            var varKey = this.varKey,
                varName = this.getRandom(),
                callback = args.success;
                
            //添加变量
            args.data  = jQuery.extend({},args.data);
            args.data[args.varKey || varKey] = args.varName || varName;
            
            //重写回调函数
            if(typeof callback === "function"){
                args.success = function(){
                    callback(window[varName]);
                };
            }
            args.dataType = "script";
            delete args.varKey;
            delete args.varName;
            return jQuery.ajax(args);
        },
        
        getProxy: function(args){
            var _frameName = null,
                _jQuery = null,
                proxyUrl = args.proxyUrl || this.proxyUrl,
                proxyId = args.proxyId || this.proxyId;
                
            _frameName = frames[proxyId];
            _jQuery = _frameName && _frameName.jQuery;
                
            if (_jQuery) {
                return _jQuery.ajax(args);
            } else {
                if(!_frameName){
                    jQuery('body').append('<iframe src="'+ proxyUrl+ '"' + 
                                    ' name="' + proxyId + '" '+
                                    ' id="' + proxyId + '" '+
                                    ' style="display:none"></iframe>');
                    jQuery("#" + proxyId).load(function(){
                        if (typeof args.charset !=='undefined') {
		                    document.charset = args.charset;// 设置编码
		                }
                        return  frames[proxyId].jQuery.ajax(args);
                    });
                }
            }
        },
        
        request: function(args){
            var tfType = args.tfType || "json";
            delete args.tfType;
            
            if(tfType === "script"){
                return this.getScript(args);
            }else if(tfType === "proxy"){
                return this.getProxy(args);
            }else{
                //直接执行调用
                return jQuery.ajax(args);
            }
        }
    };
    
    return AjaxProxy;
});