
define(['core/Common','util/BomHelper'],function(Common,BomHelper){
    
    var jQuery = Common.jQuery,
        Template = Common.Template;
    
    BomHelper.loadCss("resources/css/pageBar.css");    
    function PageBar(cfg){
        jQuery.extend(this,{
            config:{},
            
            val: 0, //当前页码
            
            domEl: null
        });
        this.init(cfg);
    }
    
    jQuery.extend(PageBar.prototype, {
    
        defaultCfg: {
            el : null,

            align:'center',
            
            //分页个数
            total: -1,
            
            //数据总条数
            totalNum:-1, 
            
            //分页大小。如果配置了total，则不再利用该配置项重新计算total的值。
            pageSize: 10,
            
            //分页码个数
            maxPage : 10,
            
            //初始页码
            page : 1,
            
            //单击页面的回调函数
            onPage: null    ,
            
            jumpTo: true
        },
        tpl: new Template('<a href="#"  class="{cls}" val={n}>{n}</a>'),
        dotStr: '<span>...</span>',
        
        init: function(cfg){
            jQuery.extend(this.config,this.defaultCfg);
            jQuery.extend(true,this.config,cfg);
            
            if(this.config.total < 0 && this.config.pageSize > 0){
                this.config.total = Math.ceil(this.config.totalNum/this.config.pageSize);
            }
            if(typeof this.config.el == 'string'){
                this.config.el = jQuery("#" + this.config.el);
            }
            
            this.domEl = this.config.el;
            this.domEl.empty().addClass('ui_pageBar ' + this.config.align);
            
            this.bindEvent();
            
            this.setList(this.config.page);
        },
        addTotalItems: function(num){
            var cfg = this.config;
            cfg.totalNum += num;
            cfg.total = Math.ceil(cfg.totalNum/cfg.pageSize);
        },
        delTotalItems: function(num){
            var cfg = this.config;
            cfg.totalNum -= num;
            cfg.total = Math.ceil(cfg.totalNum/cfg.pageSize);
        },
        setList : function(page){
            
            this.val = page;
            
            var ah=[],i,j,count,
                total = this.config.total,    //分页个数
                maxPage = this.config.maxPage; //显示项个数
            
            var tpl = this.tpl;

            ah.push('<a href="#" class="ui_pageBar_previous" style="visibility:' +
                        (page > 1?'visible':'hidden')+'">上一页</a>');
            if(total <= maxPage){
                for(i=1; i<=total;i++){
                    if(i == page){
                        ah.push(tpl.apply({cls:"current",n:i}));
                    }else{
                        ah.push(tpl.apply({n:i}));
                    }
                }
            }else{
                var side = Math.ceil((maxPage-2)/2);
                if(page - side <= 2){
                    for(i=1; i < page; i++){
                        ah.push(tpl.apply({n:i}));
                    }
                    ah.push(tpl.apply({cls:"current",n:page}));
                    for(i++;i < maxPage;i++){
                        ah.push(tpl.apply({n:i}));
                    }
                    if(maxPage != total){
                        ah.push(this.dotStr);
                    }
                    ah.push(tpl.apply({n:total}));
                }else if(page+side+1 > total){
                    ah.push(tpl.apply({n:1}));
                    ah.push(this.dotStr);
                    for(i=total-maxPage+2;i<=total;i++){
                        ah.push(tpl.apply({cls:(i == page?'current':'') , n:i}));
                    }
                }else{
                    ah.push(tpl.apply({n:1}));
                    ah.push(this.dotStr);
                    count = 1;
                    for(i=page-side+1;i<page;i++){
                        ah.push(tpl.apply({n:i}));
                        count++;
                    }
                    ah.push(tpl.apply({cls:"current",n:page}));
                    var right = Math.min(maxPage-count-2,side);
                    i=page+1;
                    for(j=0;j<right;j++){
                        ah.push(tpl.apply({n:i}));
                        i++;
                    }
                    if(maxPage != total){
                        ah.push(this.dotStr);
                    }
                    ah.push(tpl.apply({n:total}));
                }
            }
            ah.push('<a href="#" class="ui_pageBar_next" style="visibility:' +
                        (page < total?'visible':'hidden')+'">下一页</a>');
            
            ah.push([
    	         '<ins><form action="">',
    	         	'<span>共'+this.config.totalNum+'条记录</span>',
    	         	this.config.jumpTo ? [
	    	         	'<span>，跳到第</span>',
	    	         	'<input type="text" class="ui_pageBar_jumpto" >',
	    	         	'<span>/'+total+'页</span>',
	    	         	'<button class="ui_pageBar_jump">确定</button>'].join('') : "",
	         	'</form></ins>'
	         ].join(''));

            this.config.el.html(ah.join(''));
        },
        
        updatePage: function(page){
        	if(!isNaN(page)){
                page = Math.min(page,this.config.total);
                page = Math.max(page,1)
                if(page === 0){
                    _this.config.el.empty();
                    return;
                }
                this.setList(page);
                if(typeof this.config.onPage === "function"){
                    this.config.onPage(page);
                }
            }
        },
        bindEvent: function(){
            var _this = this,
                page = this.val;
            this.domEl.on('click','.ui_pageBar_jump',function(){
            	var jumpVal = $(this).siblings(".ui_pageBar_jumpto").val();
            	_this.updatePage(jumpVal);
            }).on('keypress','.ui_pageBar_jumpto',function(e){
            	if(e.keyCode === 13){
            		_this.updatePage($(this).val());
            	}            	
            }).on('click','a',function(e){
                var target = $(e.target);
                e.preventDefault();
                if(target.hasClass("ui_pageBar_previous")){
                    page = _this.val - 1;
                }else if(target.hasClass("ui_pageBar_next")){
                    page = _this.val + 1;
                }else{
                    page = parseInt(target.attr("val"),10);
                }
                _this.updatePage(page);
            });
        }
    });

    return PageBar;
});
