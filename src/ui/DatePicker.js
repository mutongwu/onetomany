/**
 * @author shawn.
 * @example
 * 
 * var dtPicker = new DatePicker({
          el: jQuery('#box')
//        hasTime: true,
//        format: "YYYY-MM-DD hh:mm:ss",
//        val: 2010-10-10,
//        minVal:'2012-10-05',
//        maxVal:'2013-01-01'
    });
 */

define(['core/Common','util/BomHelper','util/Format'],function(Common,BomHelper,Format){

    
   var jQuery = Common.jQuery;
   
   
   function DatePicker(cfg){
       jQuery.extend(this,{
        
           minTime: null,
	       maxTime: null,
	       todayDt: null,
	       val: null,
           
	       elWidth: 0,           //控件的宽度
           elHeight: 0,          //控件的高度
           config: {},
           domEl: null
           
       });
       this.init(cfg);
   }
   
   jQuery.extend(DatePicker.prototype,{
   
    
       defaultCfg: {
           id: null,
           el: null,
           val: null,
           
           zIndex: 100,
           
           //显示时分秒选项。
           hasTime: false,
           
           //当前只支持 util/Format里面的日期格式.带时分秒的日期默认格式为 YYYY-MM-DD hh:mm:ss
           format: "YYYY-MM-DD",
           
           //日期最小值
           minVal:'2012-10-05',
           
           //日期最大值
           maxVal:'2970-01-01'
       },
       
       
       init: function(cfg){
           jQuery.extend(this.config,this.defaultCfg);
           jQuery.extend(this.config,cfg);
           
           this.config.el.attr("readOnly",true);
           this.initVal();
           
           var _this = this;
           this.config.el.click(function(ev){
                ev.stopPropagation();
                _this.show();
                
           });
       },
       days:[31,28,31,30,31,30,31,31,30,31,30,31,30],
       dayNames:["日","一","二","三","四","五","六"],
       
       initVal: function(){
           this.minTime = Format.parseDate(this.config.minVal).getTime();
           this.maxTime = Format.parseDate(this.config.maxVal).getTime();
           this.todayDt = new Date();
           
           var val = this.config.el.attr("value") || this.config.val; 
           if(!val){
               val = new Date();
           }else if(typeof val === "string"){
               this.config.el.attr("value",val);
               val = Format.parseDate(val);
           }
           this.val = val;
           this.config.id = this.config.id ? this.config.id: Common.id(); 
       },
       createDay: function(curr,i,date,aCls){
           curr.setDate(i);       
           var cls = [];
           if(curr.getDay() === 0 || curr.getDay() === 6){
               cls.push("weeken");
           }
           if( i === date){
               cls.push("curr");
           }
           if(aCls){
               cls.push(aCls);
           }
           var currTime = curr.getTime();
           if( currTime <  this.minTime || currTime > this.maxTime){
               cls.push("inValid");
           }
           return '<td class="ui_datePicker_td '+cls.join(" ")+'">'+i+'</td>';
       },
       
       createDays: function(year,mon,date){
           var days =  this.days[mon] + (mon=== 1 && Format.isLeapYear(year) ? 1:0),
               curr = new Date(year,mon,date,0,0,0);
           var preMon = (mon+11)%12,
               preYear = (mon === 0 ? year-1: year), 
               preDays = this.days[preMon] + (preMon === 1 && Format.isLeapYear(year) ? 1:0),
               nextMon = (mon+1)%12,
               nextYear = (mon === 11 ? year+1:year);
           
           curr.setDate(1);
           var beginDay = curr.getDay();
           var _html = ['<tbody><tr class="ui_datePicker_tr">'];
           var j = 0;
           
           //输出前一个月日期
           curr.setFullYear(preYear);
           curr.setDate(1);
           curr.setMonth(preMon);
           for(var i=preDays - beginDay + 1; i <= preDays;i++){
               _html.push(this.createDay(curr,i,null,"preMDay"));
           }

           //输出当前月份日期
           curr.setDate(1);
           curr.setMonth(mon);
           for(var i=1; i <= days; i++){
               _html.push(this.createDay(curr,i,date));
               if((i+beginDay)%7 === 0){
                    _html.push("</tr>");
                    _html.push('<tr class="ui_datePicker_tr">');
               }
           }
           
           //输出下一月份的日期
           curr.setFullYear(nextYear);
           curr.setDate(1);
           curr.setMonth(nextMon);
           // 42 = 6行*7列 
           j = 42 - beginDay - days;
           var tmp = beginDay + days;
           for(var i=1; i <= j;i++){
               _html.push(this.createDay(curr,i,null,"nextMDay"));
               if((i+tmp)%7 === 0){
                    _html.push("</tr>");
                    _html.push('<tr class="ui_datePicker_tr">');
               }
           }
           _html.push("</tr></tbody>");
           return _html.join('');
       },
       
       createHd: function(){
           var names = "";
           for(var i=0;i<this.dayNames.length;i++){
               names +="<th>" + this.dayNames[i] + "</th>";
           }
           return '<thead class="ui_datePicker_hd"><tr class="ui_datePicker_title"><th class="ui_datePicker_preYear">&lt;&lt;</th><th class="ui_datePicker_preMonth">&lt;</th>' +
                   '<th class="ui_datePicker_curr" colspan=3><span  class="ui_datePicker_currMonth">' + (this.val.getMonth()+1) + '</span>' +
                   '<span class="ui_datePicker_currYear">' + this.val.getFullYear() + '</span></th>' + 
                   '<th class="ui_datePicker_nextMonth">&gt;</th><th class="ui_datePicker_nextYear">&gt;&gt;</th></tr>' +
                   '<tr class="ui_datePicker_names">'+names+'</tr>'+
                   '</thead>'; 
        
       },
       createFt: function(){
           return '<tfoot class="ui_datePicker_ft"><tr><td></td><td colspan="2"><span class="set_clear">清空</span></td><td colspan="2"><span class="set_today">今天</span></td><td colspan="2"><span class="set_ok">确定</span></td></tr></tfoot>';
       },
       
       createSelectDom: function(st,end,cls,val){
           var _html = ['<select class="'+cls+'">'];
           for(var i=st;i<end;i++){
                if(val === i){
                    _html.push('<option value="'+i+'" selected>' + (i<10 ? "0"+i: i) + '</option>');
                }else{
                    _html.push('<option value="'+i+'">' + (i<10 ? "0"+i: i) + '</option>');
                }
           }
           _html.push('</select>');
           return _html.join('');
       },
       createTimeBd: function(){
           return '<tbody class="ui_datePicker_timeBd"><tr><td colspan="7">'+
                    this.createSelectDom(0,24,'sel_hour',this.val.getHours()) +
                    '<span class="time_sep">:</span>' +
                    this.createSelectDom(0,60,'sel_min',this.val.getMinutes()) +
                    '<span class="time_sep">:</span>' +
                    this.createSelectDom(0,60,'sel_sec',this.val.getSeconds()) +
                    '</tr></tbody>';
       },
       
       initDom: function(){
           var val = this.val;
           
           var hd = this.createHd();
           var ft = this.createFt();
           var bd = this.createDays(val.getFullYear(),val.getMonth(),val.getDate());
           var timeBd = this.config.hasTime ? this.createTimeBd(): '';
           
           var _html = [
                '<div class="ui_datePicker_box" id="'+this.config.id+'"><table>',
                        hd,
                        bd,
                        timeBd,
                        ft,
                 '</table></div>'
           ].join('');
           jQuery(document.body).append(_html);
           
           this.domEl = jQuery("#" + this.config.id);
       },
       
       update: function(){
           var year = this.val.getFullYear(),
               month = this.val.getMonth();
           
           var bd = this.createDays(year,month,this.val.getDate());
           this.domEl.find('tbody').eq(0).replaceWith(bd);
           this.domEl.find('.ui_datePicker_currMonth').html(month+1);
           this.domEl.find('.ui_datePicker_currYear').html(year);
           
           if(this.config.hasTime){
              this.domEl.find('.sel_hour').attr("value",this.val.getHours());
              this.domEl.find('.sel_min').attr("value",this.val.getMinutes());
              this.domEl.find('.sel_sec').attr("value",this.val.getSeconds());
           }
       },
       
       updateValue: function(val){
           this.val = val ? val:new Date();
           if(this.config.hasTime){
              this.val.setHours(this.domEl.find('.sel_hour').attr("value"));
              this.val.setMinutes(this.domEl.find('.sel_min').attr("value"));
              this.val.setSeconds(this.domEl.find('.sel_sec').attr("value"));
           }
           if(!val){
               this.config.el.attr("value","");
           }else{
               var t = this.val.getTime();
	           if(this.minTime < t && t < this.maxTime){
	                this.config.el.attr("value",Format.formatDate(val,this.config.format));
	           }
           }
       },
       
       calPosition: function(){
            var pos = null , 
                winSize = {
	                w: Math.max(BomHelper.docSize.width,BomHelper.viewSize.width),
	                h: Math.max(BomHelper.docSize.height,BomHelper.viewSize.height)
	            },
                width = this.elWidth ? this.elWidth: this.domEl.outerHeight(),
                height = this.elHeight ? this.elHeight: this.domEl.outerWidth(),
                top = 0,
                left = 0;
           
            pos = this.config.el.position();
            if(pos.top + height > winSize.h){
                top = pos.top - height - this.config.el.outerHeight() - 5;
            }else{
                top = pos.top + this.config.el.outerHeight() + 5;
            }
            if(pos.left + width > winSize.w){
                left = winSize.w - width - 10;
            }else{
                left = pos.left;
            }        
            this.elWidth  = width;
            this.elHeight = height;
            return {"top":top,"left":left};
       },
       
       show: function(){
           var pos = null;
           // 延迟初始化
           if(!this.domEl){
               this.initDom();
               this.initEvent();
               
               pos = this.calPosition();
               this.domEl.css({"visibility":"visible","zIndex":this.config.zIndex,"top":pos.top,"left":pos.left});
           }else{
               this.update();
               pos = this.calPosition();
               this.domEl.css({"display":"block","top":pos.top,"left":pos.left});
           }
       },
       
       onClickFn: function(t){
	        if(t.hasClass("inValid")){
	             return;
	        }else if(t.hasClass("ui_datePicker_td")){
	             this.val.setDate(t.html());
	             if(t.hasClass("preMDay")){
	                this.val.setMonth(this.val.getMonth() - 1);
	             }else if(t.hasClass("nextMDay")){
	                this.val.setMonth(this.val.getMonth() + 1);
	             }
                 
	             this.updateValue(this.val);
                 if(this.config.hasTime){
                    t.closest("tbody").find('td').removeClass('curr');
                    t.addClass('curr');
                 }else{
                    this.domEl.hide();
                 }
	        }else{
	             var cls = t.get(0).className;
	             switch(cls){
	                 case "ui_datePicker_preYear": 
	                     this.val.setFullYear(this.val.getFullYear()-1); 
	                     this.update();
                         break;
	                 case "ui_datePicker_preMonth":
	                     this.val.setMonth(this.val.getMonth()-1); 
	                     this.update();
                         break;
	                 case "ui_datePicker_nextYear":
	                     this.val.setFullYear(this.val.getFullYear()+1);
	                     this.update();
                         break;
	                 case "ui_datePicker_nextMonth":
	                     this.val.setMonth(this.val.getMonth()+1);
	                     this.update();
                         break;
	                 case "set_clear":
	                     this.updateValue(null);
                         this.domEl.hide();
                         break;
	                 case "set_today":
	                     this.updateValue(this.todayDt);
                         this.domEl.hide();
                         break;
	                 case "set_ok":
	                     this.updateValue(this.val);
                         this.domEl.hide();
                         break;
	             }
	        }        
       },
       initEvent: function(){
            var _this = this;
            
            jQuery(document.body).click(function(ev){
                if(!jQuery.contains(_this.domEl[0], ev.target)){
                    _this.domEl.hide();
                }
            });
            
            this.domEl.click(function(event){
                 var t = jQuery(event.target);
                 _this.onClickFn(t);
            });
       }
       
   });
   
   return DatePicker;
});