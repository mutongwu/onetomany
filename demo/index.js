
var tabControler = {
    
    //第一个折行的菜单元素索引
    hideIdx: -1,
    timer: 0,
    
    init: function(){
        this.initCfg();
        this.initShadowMenu();
        this.bindEvent();
    },
    initCfg: function(){
        this.tabNav = jQuery(".tabNav");
        this.liEls = this.tabNav.find("li");

        //盒子宽度
        this.wB = this.tabNav.width();
        
        //隐藏在左侧的菜单个数
        this.counter = 0;
        
        //第一个菜单
        this.firstEl = this.tabNav.find("li:first");
        //最后一个菜单
        this.lastEl = this.tabNav.find("li:last");
        
        //菜单宽度
        this.w0 = this.firstEl.outerWidth() + parseInt(this.firstEl.css("marginLeft"),10)
                    + parseInt(this.firstEl.css("marginRight"),10);
        
        //菜单的top偏移，利用该偏移检测li元素是否折行。
        this.firstTop = this.firstEl.offset().top;
        
    },
    
    initShadowMenu: function(){
        this.shadowMenu = jQuery("<div class='shadowMenu'></div>");
        this.shadowMenu.appendTo(document.body);
    },
    
    createShadowMenu: function (ctrlMore){
        var _this = this;
        var offset = ctrlMore.offset();
        this.hideIdx = -1;
        this.liEls.each(function(i,item){
            if(_this.hideIdx === -1){
                //寻找第一个折行的菜单元素索引
                if(jQuery(this).offset().top != _this.firstTop){
                    _this.hideIdx = i;
                }   
            }
        });

        if(this.hideIdx === -1){
            this.shadowMenu.hide();
        }else{
            this.shadowMenu.html(
                this.liEls.filter(':gt('+(_this.hideIdx-1)+')').clone(false)
            ).css({
                top: offset.top + ctrlMore.height()- 2,
                left: offset.left - 150 + ctrlMore.width()
            }).show();
        }
   },
   bindEvent: function(){
       var _this = this;
        
       // if(this.liEls.size() * this.w0 > this.wB){
            //更多菜单下拉事件
            _this.shadowMenu.mouseenter(function(){
                clearTimeout(_this.timer);
                _this.timer = null;
            }).mouseleave(function(){
                _this.shadowMenu.hide();
            });
            
            //菜单滚动事件
            jQuery(".ctrlLeft").click(function(e){
                e.preventDefault();
                if(_this.counter === 0){
                    return;
                }
                var tmp = _this.tabNav.css("marginLeft");
                _this.tabNav.css("marginLeft",parseInt(tmp,10) + _this.w0);
                _this.counter += 1;
                _this.hideIdx -= 1;
                _this.shadowMenu.prepend(_this.liEls.eq(_this.hideIdx).clone(false));
            });
            jQuery(".ctrlRight").click(function(e){
                e.preventDefault();
                
                if(_this.lastEl.offset().top === _this.firstTop){
                    return;
                }
                
                var tmp = _this.tabNav.css("marginLeft");
                _this.tabNav.css("marginLeft",parseInt(tmp,10) - _this.w0);
                _this.counter -= 1;
                _this.hideIdx += 1;
                _this.shadowMenu.find('li:first').remove();
            });
            jQuery('.ctrlMore').mouseenter(function(e){
                _this.createShadowMenu(jQuery(this));
            }).mouseleave(function(e){
                if(!_this.timer){
                    _this.timer = setTimeout(function(){
                        _this.shadowMenu.hide();    
                    },1000);
                }
                
            });
        // }   
   }
    
};
jQuery(function(){
    var $ = jQuery;
    var tabNav = $('#tabNav'),
        mainCnt = $('#mainCnt'),
        inner = $('#inner');

    var padH = parseInt(mainCnt.css('paddingTop'),10)
             + parseInt(mainCnt.css('paddingBottom'),10);
    var cntMH = inner.height()- padH;
    function onResize(){
        cntMH = Math.max(inner.height()- padH,cntMH);
        
        //update iframe height
        mainCnt.find('.activePage iframe').css("height",cntMH);
    }
    $(window).resize(onResize);
    
    
    function selMainCnt(dataId,content){
        var actItem = null;
        actItem = mainCnt.find('.pageCnt').filter('[data-id="'+dataId+'"]');
        if(!actItem.size()){
            actItem = $('<div data-id="'+dataId+'" class="pageCnt">'+content+'</div>');
            mainCnt.append(actItem);
        }
        
        actItem.siblings('.pageCnt').removeClass('activePage').end().addClass('activePage');
        
    }
    function removeMainCnt(dataId){
        mainCnt.find('.pageCnt').filter('[data-id="'+dataId+'"]').remove();
    }
    
    function selTabNav(dataId,title){
        var actItem = null;
        var actItem = tabNav.find('li[data-id='+dataId+']');
        if(!actItem.size()){
            actItem = $('<li data-id="'+dataId+'"><a href="#d">'+title+'<span class="closeIco"></span></a></li>');
            tabNav.append(actItem);
        }
        tabNav.find("li").removeClass("active");
        actItem.addClass('active');
    }
    
    function removeTabNav(dataId){
        tabNav.find('li[data-id='+dataId+']').remove();
    }
    tabNav.on('click','a',function(e){
        e.preventDefault();
        var el = $(this),
            dataId = null;
        tabNav.find('li').removeClass('active');
        dataId = el.closest('li').addClass('active').attr("data-id");
        selMainCnt(dataId); 
        
    }).on('click','.closeIco',function(e){
        e.stopPropagation();
        var liEl = $(this).closest('li');
        var dataId = liEl.attr("data-id");
        var preDataId = liEl.prev().attr("data-id");
        
        //导航条
        removeTabNav(dataId);
        //内容区
        removeMainCnt(dataId);
        
        //设置下一个激活的标签 
        if(liEl.hasClass('active')){
            selTabNav(preDataId);
            selMainCnt(preDataId);  
        }
          
    });
    
    $('#left').find('dt').click(function(){
        var title = $(this).html(),
            content = $(this).parent().html();
        var dataId = $(this).attr("data-id");
        
        //导航条
        selTabNav(dataId,title);
        //内容区
        content = '<iframe id="iframe_'+dataId+'" height="'+cntMH+'px" width="100%" src="b.html" frameborder=0 />';
        selMainCnt(dataId,content);
    });
    
    tabControler.init();
    
    /*require(['ui/SearchInput'],function(SearchInput){
        
    });*/
});