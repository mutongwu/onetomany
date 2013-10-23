define(['util/BomHelper'],function(BomHelper){
    
    BomHelper.loadCss("resources/css/picRotate.css");
    function PicRotate(args){
        this.init(args);
    }
    
    (function(packager){
        jQuery.extend(packager,{
        
            canvasAvail: false,
            
            defaultCfg: {
                maxWidth: 500
            },
            init: function(cfg){
                this.config = jQuery.extend({},this.defaultCfg,cfg);
                this.initDom();
                this.bindEvent();
            },
            rotate: function(pic,angle){
                
                var domEl = jQuery(pic).addClass("ui_PicRotate_pic"),
                    pNode = domEl.parent();
                    
                if(!pNode.hasClass("ui_PicRotateBox")){
                    domEl.wrap("<div class='ui_PicRotateBox'></div>");
                    pNode = domEl.parent();
                }
                
                var an = parseInt(domEl.attr("_angle") || 0,10),
                    w = domEl.width(),
                    h = domEl.height(),
                    w1 = parseInt(domEl.attr("w0") || 0,10),
                    h1 = parseInt(domEl.attr("h0") || 0,10);
		        if(!w1){
                    domEl.attr("w0",w);
                    domEl.attr("h0",h);
                }
                
                var newW = w1,
                    newH = h1;

                an = (an + angle + 360)%360;
                
                if(an === 90 || an === 270){
                    newH = Math.min(this.config.maxWidth,h);
                    newW = Math.ceil(newH/h*w);
                    pNode.css({"height":newW,"width":newH});
                }else{
                    pNode.css({"height":h1,"width":w1});
                }
                
                var sinVal = 0,
                    cosVal = 0,
                    fixDy = 0, //调整CSS3旋转时候，图片落入显示区域的中心。
                    fixDx = 0, //调整CSS3旋转时候，长宽的变化导致中心的“偏移”。
                    matrixStr = '';
                switch(an){
                    case 0: sinVal = 0;cosVal = 1;break;
                    case 90: sinVal = 1;cosVal = 0;
                        fixDy = (newW - newH)/2;
                        fixDx = Math.min((newH-w)/2,0);
                        break;
                    case 180: sinVal = 0;cosVal = -1;
                        break;
                    case 270: sinVal = -1;cosVal = 0;
                        fixDy = (newW - newH)/2;
                        fixDx = Math.min((newH-w)/2,0);
                        break;
                    default: 
                        an = an/180 * Math.PI;
                        sinVal = Math.sin(an);
                        cosVal = Math.cos(an);
                }
                if(jQuery.browser.msie && jQuery.browser.version < 9){
                    
                    pic.style.filter = 'progid:DXImageTransform.Microsoft.Matrix(enabled="true",sizingmethod="auto expand")';
                    var filterObj = pic.filters["DXImageTransform.Microsoft.Matrix"];
				    
				    filterObj.M11= cosVal;
				    filterObj.M12 = -sinVal;
				    filterObj.M21 = sinVal;
				    filterObj.M22 = cosVal;
                }else{
                    //CSS3的旋转中心是旋转对象的中心。
                    matrixStr = 'matrix(' + [cosVal,sinVal,-sinVal,cosVal,fixDx,fixDy].join(",") + ")";
                    if("transform" in pic.style){
                        pic.style.transform = matrixStr;
                    }else if ("msTransform" in pic.style) { // IE9
                        pic.style.msTransform = matrixStr;
                    }else if ("MozTransform" in pic.style) { // Mozilla
                        pic.style.MozTransform = matrixStr;
		            } else if ("OTransform" in pic.style) { // Opera
		                pic.style.OTransform = matrixStr;
		            } else if ("webkitTransform" in pic.style) { // Chrome Safari
		                pic.style.webkitTransform = matrixStr;
		            }
                }
                domEl.css("width",newW);
                domEl.attr("_angle",an);
            },
            initDom: function(){
            },
            
            bindEvent: function(){
	            var _this = this;
		        if(this.config.leftCtrl){
		            this.config.leftCtrl.each(function(i){
		                jQuery(this).click(function(){
		                    var pic = _this.config.el.get(i);
		                    if(pic){
		                        _this.rotate(pic,-90);
		                    }
		                });
		            });
		        }
		        if(this.config.rightCtrl){
		            this.config.rightCtrl.each(function(i){
		                jQuery(this).click(function(){
		                    var pic = _this.config.el.get(i);
		                    if(pic){
		                        _this.rotate(pic,90);
		                    }
		                });
		            });
		        }
            }
        });
    })(PicRotate.prototype);
    
    return PicRotate;
});