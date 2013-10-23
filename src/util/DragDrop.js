/**
 * @author shawnwu
 * @date 2013-10-23
 * @description 元素拖拽支持
 */
define(['util/BomHelper'],function(BomHelper){
	function DragDrop(cfg){
	    if(this instanceof DragDrop === false){
	        return new DragDrop(cfg);
	    }
	    return this.init(cfg);
	}
	DragDrop.prototype = {
	    constructor: DragDrop,
	    posData:null,
	    shadowEl: null,
	    dropElDim: null,
	    enter: false,
	    activeEl: null,
	    
	    isNativeDD:(function(){
	        var el = document.createElement("div");
	        if("draggable" in el){
	            return true;
	        }else{
	            return false;
	        }
	    })(),
	    browser: {
	        webkit:BomHelper.engine.webkit,
	        safari: BomHelper.browser.safari,
	        mozilla:  BomHelper.browser.firefox
	    },
	
	    diff:{x:0,y:0},
	    dataTransfer: {},
	    init: function(cfg){
	        if(!cfg.dragEl){return;}
	        //TODO 不能直接使用jq1.84的attr方法，似乎跟ie6/7有冲突
	        cfg.dragEl.each(function(i,item){
	            item.setAttribute("draggable","true");
	        });
	        this.config = jQuery.extend({},cfg);
	        this.bindEvents();
	    },
	    dragStart: function(e){
	        if(this.browser.mozilla){ //required to call for mozilla 
	            e.dataTransfer.setData('text/plain', this.id);
	        }
	        var t = e.target || e.srcElement;
	        if(this.browser.safari){
	            e.dataTransfer.setData('text/plain', this.id);
	            this.diff.x = e.clientX - t.offsetLeft;
	            this.diff.y = e.clientY - t.offsetTop;
	        }
	        this.dataTransfer.source = e.target || e.srcElement;
	        this.fireEvent('ondragstart',e,{
	             x: this.browser.webkit ? e.clientX : e.screenX,
	            y: this.browser.webkit ? e.clientY : e.screenY,
	            source: t
	        });
	    },
	    
	    dragEnd: function(e){
	        var x =  this.browser.webkit ? e.clientX : e.screenX,
	            y =  this.browser.webkit ? e.clientY : e.screenY;
	           
	        if(this.browser.safari){
	            x -= this.diff.x;
	            y -= this.diff.y;
	        }
	        this.fireEvent("ondragend",e,jQuery.extend({
	            x: x,
	            y: y
	        },arguments[1]));
	        
	        //safari5.1版本有bug，无法正确触发drop事件
	        if(this.browser.safari){
	            this.dragdrop(e,this.dataTransfer);
	        }
	        this.dataTransfer = {};
	    },
	    
	    dragenter: function(e){
	        // required for IE.
	        // http://msdn.microsoft.com/en-us/library/ie/ms536929(v=vs.85).aspx
	        if(e.preventDefault){
	            e.preventDefault();
	        }else{
	            e.returnValue = false;
	        }
	        this.fireEvent("ondragenter",e,{source: this.dataTransfer.source});
	
	        if(this.browser.safari){
	            this.dataTransfer.target = e.target;
	            
	        }
	    },
	    
	    dragleave: function(e){ this.fireEvent("ondragleave",e,{});},
	    
	    dragover: function(e){
	        if(e.preventDefault){
	            e.preventDefault();
	        }else{
	            e.returnValue = false;
	        }
	    },
	    
	    dragdrop: function(e){
	        if(e.preventDefault){
	            e.preventDefault();
	        }else{
	            e.returnValue = false;
	        }
	        this.fireEvent("ondragdrop",e,jQuery.extend({
	            source: this.dataTransfer.source,
	            target: e.target || e.srcElement
	        },arguments[1]));
	    },
	    
	    mousedown: function(e){
	//        e.stopPropagation();
	        this.activeEl = jQuery(e.target).closest("[draggable]");
	        this.activeEl.addClass("dragActive");
	        
	        //鼠标位置与元素坐标的偏移
	        this.posData = {
	            deltX: e.clientX - this.activeEl.offset().left,
	            deltY: e.clientY - this.activeEl.offset().top
	        };
	        
	        this.dataTransfer.source = this.activeEl.get(0);
	        this.fireEvent("ondragstart",e,{
	            x: e.clientX,
	            y: e.clientY,
	            source: this.activeEl.get(0)
	        });
	        
	        //缓存 drop元素的位置、长宽
	        var dropElDim = null,
	            t = null;
	        if(this.config.dropEl){
	            dropElDim = [];
	            this.config.dropEl.each(function(i,target){
	                t = jQuery(target);
	                dropElDim.push({
	                    el: target,
	                    w: t.width(),
	                    h: t.height(),
	                    top: target.offsetTop,
	                    left: target.offsetLeft
	                });
	            });
	            this.dropElDim = dropElDim;
	        }
	        this.createShadow();
	    },
	    
	    mousemove: function(e){
	        if(this.activeEl){
	            this.shadowEl.css({
	                display: "block",
	                left: e.clientX - this.posData.deltX,
	                top: e.clientY - this.posData.deltY
	            });
	            var _this = this,
	                tmp = null,
	                found = false;
	            if(this.dropElDim){
	                tmp = this.shadowEl.offset();
	                jQuery.each(this.dropElDim,function(i,item){
	                    
	                    if(tmp.left > item.left && tmp.left < (item.left + item.w) && 
	                        tmp.top > item.top && tmp.top < (item.top + item.h)){
	                        
	                        found = true;
	                        _this.dataTransfer.target = item.el;
	                        if(_this.enter){
	                            return false;
	                        }                        
	                        if(_this.enter === false){
	                            _this.fireEvent("ondragenter",e,{
	                                x: e.clientX,
	                                y: e.clientY,
	                                source: _this.activeEl.get(0),
	                                target: item.el
	                            });
	                            _this.enter = true;
	                        }                       
	                        return false;
	                    }
	                });
	                if(!found && this.enter){
	                    this.enter = false;
	                    this.fireEvent("ondragleave",e,{
	                        x: e.clientX,
	                        y: e.clientY,
	                        source: _this.activeEl.get(0),
	                        target: e.relatedTarget
	                    });
	                }
	            }
	            
	        }
	    },
	    
	    mouseup: function(e){
	        if(this.activeEl){      
	            this.activeEl.removeClass("dragActive");
	            this.activeEl = null;
	            var data = {
	                x: e.clientX,
	                y: e.clientY,
	                source: this.dataTransfer.source,
	                target: this.dataTransfer.target
	            };
	            this.enter && this.fireEvent("ondragdrop",e,data);
	            this.fireEvent("ondragend",e,data);
	            this.enter = false;
	            this.shadowEl.hide();
	        }
	    },
	    
	    //触发事件
	    fireEvent: function(evType,e,data){
	        if(typeof this.config[evType] === "function"){
	            this.config[evType].call(this,e,data);
	        }
	    },
	    
	    createShadow: function(){
	        if(!this.shadowEl){
	            this.shadowEl = jQuery("<div></div>");
	            jQuery(document.body).append(this.shadowEl);
	        }
	        var el = jQuery(this.activeEl),
	            offset = el.offset();
	        this.shadowEl.css({
	            display: "none",
	            position: "absolute",
	            width: el.outerWidth(),
	            height: el.outerHeight(),
	            top: offset.top,
	            left: offset.left,
	            opacity: 0.5,
	            background:"#ffff00"
	        });        
	        return this.shadowEl;
	    },
	    bindEvents: function(){
	        
	        var _this = this,
	            simulate = false,
	            dragstartFn = function(e){  _this.dragStart(e);  },
	            dragendFn = function(e){ _this.dragEnd(e);},
	            handleDragEnter = function(e){_this.dragenter(e);},
	            handleDragLeave = function(e){_this.dragleave(e);},
	            handleDrop = function(e){
	                 _this.dragdrop(e);
	            },
	            handleDragOver = function(e){_this.dragover(e);},
	            selectStartFn = function(e){
	                e.returnValue = false;
	                e.srcElement.dragDrop();
	                return false;
	            };
	        
	        this.config.dragEl.each(function(i,source){
	            source.style.cursor = "move";
	            if(_this.isNativeDD){  //IE10+/Chrome/Safari/Firefox3.6+/Opera12+
	                source.addEventListener('dragstart',dragstartFn,false);            
	                source.addEventListener('dragend',dragendFn,false);
	            }else if(source.dragDrop){  //IE6~9
	                source.attachEvent('ondragstart',dragstartFn);
	                source.attachEvent('ondragend',dragendFn);
	                source.attachEvent('onselectstart',selectStartFn);
	            }else{  //Opera
	                simulate = true;
	            }
	        });
	        
	        if(this.config.dropEl){
	             this.config.dropEl.each(function(i,target){
	                if(_this.isNativeDD){
	                    target.addEventListener('dragenter', handleDragEnter, false);
	                    target.addEventListener('dragleave', handleDragLeave, false);
	                    target.addEventListener('dragover', handleDragOver, false);
	                    target.addEventListener('drop', handleDrop, false);
	                }else if(target.dragDrop){
	                    target.attachEvent('ondragenter', handleDragEnter);
	                    target.attachEvent('ondragleave', handleDragLeave);
	                    target.attachEvent('ondragover', handleDragOver);
	                    target.attachEvent('ondrop', handleDrop);
	                }
	            });
	        }
	        //other browser
	        if(simulate){
	            this.config.dragEl.each(function(i,item){
	                item.addEventListener('mousedown',function(e){
	                    _this.mousedown(e);
	                },false);
	            });
	            $(document).mouseup(function(e){
	                _this.mouseup(e);
	            }).mousemove(function(e){
	                _this.mousemove(e);
	            });
	        }
	    }
	};
    return DragDrop;
});