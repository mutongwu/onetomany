define(function(){
	var OnceAjax = {
	    varName: "var",
	    checkInterval: 1500,
	    cacheData: {},
	    counter: 1,
	    getRandom: function(){
	        return "onceAjax_" + (this.counter++);
	    },
	    saveData: function(id,data){
	        this.cacheData[id].data = data;
	        this.cacheData[id].bLoaded = true;
	    },
	    request: function(args){
	        var _this = this,
	            successFn = args.success,
	            oData = this.cacheData[args.id],
                callback = function(rnt){
                    _this.saveData(args.id, rnt);
                    successFn &&　successFn(rnt);
                    
                    //队列
                    while(oData.queue && oData.queue.length > 0){
                        var callArgs = oData.queue.shift();
                        callArgs.success(oData.data);
                    }
                    delete oData.queue;
                };
	        if(!oData){
	            this.cacheData[args.id] = oData = {
	                bLoading : false,
	                bLoaded : false,
	                data : null
	            };
	        }
	        if(oData.bLoaded){
	            successFn(oData.data);
	        }else{
	            if(!oData.bLoading){
                    oData.bLoading = true;
                    
	                if(args.dataType && args.dataType.toLowerCase() === "script"){
	                    var rndVar = this.getRandom();
	                    
	                    //添加变量
	                    args.data  = jQuery.extend({},args.data);
                        args.data[this.varName] = rndVar;
	                    //重写回调函数
	                    args.success = function(){
                            callback(window[rndVar]);
                        };
	                }else{
	                    //重写回调函数
	                    args.success = callback;
	                }
	                //执行调用
	                jQuery.ajax(args);
	            }else{
                    if(!oData.queue){
                        oData.queue = [];
                    }
                    oData.queue.push(args);
	            }
	        }
	    }
	};
    return OnceAjax;
});