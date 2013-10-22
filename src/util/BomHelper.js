/**
 * @author shawn
 */

define(function(){
        
    // 侦测浏览器的内核、运行平台、类型和版本    
    var client = function() {
	    var engine = {
	        // rendering engines
	        ie : 0,
	        gecko : 0,
	        webkit : 0,
	        khtml : 0,
	        opera : 0,
	        // specific version
	        ver : null
	    };
	    var browser = {
	        // browsers
	        ie : 0,
	        firefox : 0,
	        safari : 0,
	        konq : 0,
	        opera : 0,
	        chrome : 0,
	        // specific version
	        ver : null
	        // detection of rendering engines/platforms/devices here
	    };
	    var system = {
	        win : false,
	        mac : false,
	        x11 : false
	    };
	    // detect rendering engines/browsers
	    var ua = navigator.userAgent;
	    if (window.opera) {
	        engine.ver = browser.ver = window.opera.version();
	        engine.opera = browser.opera = parseFloat(engine.ver);
	    } else if (/AppleWebKit\/(\S+)/.test(ua)) {
	        engine.ver = RegExp.$1;
	        engine.webkit = parseFloat(engine.ver);
	        // figure out if it’s Chrome or Safari
	        if (/Chrome\/(\S+)/.test(ua)) {
	            browser.ver = RegExp.$1;
	            browser.chrome = parseFloat(browser.ver);
	        } else if (/Version\/(\S+)/.test(ua)) {
	            browser.ver = RegExp.$1;
	            browser.safari = parseFloat(browser.ver);
	        } else {
	            // approximate version
	            var safariVersion = 1;
	            if (engine.webkit < 100) {
	                safariVersion = 1;
	            } else if (engine.webkit < 312) {
	                safariVersion = 1.2;
	            } else if (engine.webkit < 412) {
	                safariVersion = 1.3;
	            } else {
	                safariVersion = 2;
	            }
	            browser.safari = browser.ver = safariVersion;
	        }
	    } else if (/KHTML\/(\S+)/.test(ua) || /Konqueror\/([^;]+)/.test(ua)) {
	        engine.ver = browser.ver = RegExp.$1;
	        engine.khtml = browser.konq = parseFloat(engine.ver);
	    } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
	        engine.ver = RegExp.$1;
	        engine.gecko = parseFloat(engine.ver);
	        // determine if it’s Firefox
	        if (/Firefox\/(\S+)/.test(ua)) {
	            browser.ver = RegExp.$1;
	            browser.firefox = parseFloat(browser.ver);
	        }
	    } else if (/MSIE ([^;]+)/.test(ua)) {
	        engine.ver = browser.ver = RegExp.$1;
	        engine.ie = browser.ie = parseFloat(engine.ver);
	    }
	    //detect browsers
	    browser.ie = engine.ie;
	    browser.opera = engine.opera;
	    
	    //detect platform
	    var p = navigator.platform;
	    system.win = p.indexOf('Win') === 0;
	    system.mac = p.indexOf('Mac') === 0;
	    system.x11 = (p.indexOf('X11') === 0) || (p.indexOf('Linux') === 0);
	    if (system.win) {
	        if (/Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
	            if (RegExp.$1 == 'NT') {
	                switch (RegExp.$2) {
	                    case '5.0' :
	                        system.win = '2000';
	                        break;
	                    case '5.1' :
	                        system.win = 'XP';
	                        break;
	                    case '6.0' :
	                        system.win = 'Vista';
	                        break;
                        case '6.1' :
                            system.win = 'Win7';
                            break;
	                    default :
	                        system.win = 'NT';
	                        break;
	                }
	            } else if (RegExp.$1 == '9x') {
	                system.win = 'ME';
	            } else {
	                system.win = RegExp.$1;
	            }
	        }
	    }
	    return {
	        engine : engine,
	        system : system,
	        browser : browser
	    };
	}();
    
    // 侦测浏览器的flash支持情况
    var flash = (function(){
        var hasFlash = false,
	        ver=0,
            swf = null,
            VSwf = null;  
	    if(client.browser.ie)  
	    {  
	        swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');   
	        if(swf) {  
                VSwf = swf.GetVariable("$version");  
	            hasFlash = true;  
	            ver = parseInt(VSwf.split(" ")[1].split(",")[0],10);   
	        }  
	    }else{  
	        if (navigator.plugins && navigator.plugins.length > 0)  
	        {  
	            swf = navigator.plugins["Shockwave Flash"];  
	            if (swf){  
	                hasFlash = true;  
	                var words = swf.description.split(" ");  
	                for (var i = 0; i < words.length; ++i){  
	                    if (isNaN(parseInt(words[i],10))){  
	                        continue;  
                        }
	                    ver = parseInt(words[i],10);  
	                }  
	            }  
	        }  
	    }  
	    return {hasFlash:hasFlash,ver:ver};  
    })();
    
    
    var isIE = client.browser.ie,
        isIE6 = isIE && client.browser.ver < 7;
        
    var doc = document,
        head = document.getElementsByTagName("head")[0],
        linkEls = doc.getElementsByTagName("link"),
        styleEls = doc.getElementsByTagName("style"),
        poorIE = isIE && client.browser.ver < 10,
        IMPORT_ID = "importLink_ID",
        APPEND_ID = "appendStyle_ID",
        /**
         * IE6~9 的BUG:link+style元素的个数，不能大于31个。
         */
        LIMIT = 31,
        // 至少保留两个位置给我们定义的style元素：一个用于import，一个用于append
        maxNum =  LIMIT - 2,
        isLimited = false;    
    
    /**
     * @description 创建添加一个LINK元素
     * @param {String} url 样式链接
     * @return link元素
     */
    function createLinkEl(url){
        var link = doc.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        head.appendChild(link);
        return link;
    }
    
    /**
     * @description 创建添加一个style元素
     * @param {String} str 样式规则
     * @param {String} id 元素ID
     * @return style元素
     */
    function createStyleEl(str,id){
        var el = doc.createElement("style");
        el.type = "text/css";
        if(id){
            el.id = id;
        }
        if(str){
            if(poorIE){
                el.styleSheet.cssText = str; //IE  
            }else{
                el.appendChild(document.createTextNode(str));  
            }
        }
        head.appendChild(el);
        return el;
    }    
    function checkLimit(){
        if(!isLimited && poorIE){
            if(linkEls.length + styleEls.length >= maxNum){
                isLimited = true;
            }
        }
        return isLimited;
    }
    
    function loadStyle(url){
        if(checkLimit()){
            doImportStyle(url);
        }else{
            doLoadStyle(url);
        }
    }
    
    function loadStyleStr(str){
        if(checkLimit()){
            doAppendStr(str);
        }else{
            doLoadStr(str);
        }
    }
    
    function doLoadStr(str){
        createStyleEl(str);
    }
    
    function doAppendStr(str){
        var el = doc.getElementById(APPEND_ID);
        if(!el){
            createStyleEl(str,APPEND_ID);
        }else{
            el.styleSheet.cssText = el.styleSheet.cssText + str;
        }
    }
    
    function doLoadStyle(url){
        createLinkEl(url);
    }  
    
    function doImportStyle(url){ 
        var el = doc.getElementById(IMPORT_ID),
            styleEl = null;
        if(!el){
            styleEl = createStyleEl(null,IMPORT_ID);
            styleEl.styleSheet.addImport(url);
        }else{
            el.styleSheet.addImport(url);
        }
    }
    
  
    return {
        "client": client,
        "browser": client.browser,
        "system": client.system,
        "engine" : client.engine,
        "isIE": isIE,
        "isIE6" : isIE6,
        
        "flash" : flash,
        "isNative": function(nd,p){
            return p in document.createElement(nd) ? true: false;
        },
        "docSize": {"width":document.documentElement.scrollWidth,"height":document.documentElement.scrollHeight},
        "viewSize": {"width":document.documentElement.clientWidth,"height":document.documentElement.clientHeight},
        "loadCss": function(url){
            if(/^http(s)*:\/\//i.test(url)){
                //do nothing.
            }else if(/^\//.test(url)){
                url = document.location.protocol + '//' + document.location.host +
                        document.location.port + url;
            }else{
                url = requirejs.toUrl(url);
            }
           loadStyle(url);
        },
        "loadStyleString":function(css){  
		    loadStyleStr(css);
		}  
    };
});