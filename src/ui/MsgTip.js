define(['core/Base','core/Common','util/BomHelper','ui/MsgBox'],function(Common,BomHelper,MsgBox){

    function MsgTip(cfg){
         jQuery.extend(this,{
            config:{},
            
            /**
             * @public {ui/Mask}
             */
            mask : null,
            
            /**
             * @public {jQuery element}
             */
            domEl: null
        });
        this.init(cfg);
    }
    jQuery.extend(MsgTip,{
        defaultCfg:{
            
            //弹出框的位置参考对象。默认为空，参考对象是页面文档
            el: null,
            
            //附加的css style
            style:{},
            id: '',
            
            //body内容
            msg:null,
            
            //info/warn/error/success/confirm/(empty)
            msgType: '',
            
            //是否采用fixed定位，默认为true.(不支持IE6.)
            fixed:true,
            
            //是否显示遮盖层
            noMod: false,
            
            onRender:null,
            onBeforeClose:null,
            onYes: null,
            onNo: null,
            mask: {
                lazy: true,
                loading:false
            }  
        },
        
        init: function(){}
    });
    
    return MsgTip;
});