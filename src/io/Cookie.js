/**
 * @author shawn
 */
define(function(){
    var cookie  = {
        /* 创建cookie，如果关闭浏览器cookie失效,days参数传-1。如无特殊要求，后面三个参数是固定的，见例子。
        *  例子：setCookie("__visit","123",1,"/",".tianya.cn",false)
        */
        setCookie : function(/*String*/name, /*String*/value,/*Number?*/days, /*String?*/path,/*String?*/domain,/*boolean?*/secure){
            this.setCookieNoEscape(name, escape(value), days, path, domain, secure);
        },
        
        /**
         * 不会对value使用escape
         * 创建cookie，如果关闭浏览器cookie失效,days参数传-1。如无特殊要求，后面三个参数是固定的，见例子。
         * 例子：setCookie("__visit","123",1,"/",".tianya.cn",false)
         */
        setCookieNoEscape : function(/*String*/name, /*String*/value,/*Number?*/days, /*String?*/path,/*String?*/domain,/*boolean?*/secure){
            var expires = -1,d = new Date();
    
            if(value == null){
                d.setTime(d.getTime() - (24*60*60*1000));
                expires = d.toGMTString();
            } else if((typeof days == "number")&&(days >= 0)){
                d.setTime(d.getTime()+(days*24*60*60*1000));
                expires = d.toGMTString();
            }
            document.cookie = name + "=" + value + ";"
                + (expires !== -1 ? " expires=" + expires + ";" : "")
                + (path ? "path=" + path : "")
                + (domain ? "; domain=" + domain : "")
                + (secure ? "; secure" : "");
        },
    
        /*得到cookie值*/
        getCookie: function(/*String*/name) {
            var cookieValue = null; 
            if (document.cookie && document.cookie != '') { 
                var cookies = document.cookie.split(';'); 
                for (var i = 0; i < cookies.length; i++) { 
                    var cookie = cookies[i].replace(/(^\s*)|(\s*$)/g,   "");
                    // Does this cookie string begin with the name we want? 
                    if (cookie.substring(0, name.length + 1) == (name + '=')) { 
                        cookieValue = unescape(cookie.substring(name.length + 1)); 
                        break; 
                    } 
                } 
            } 
            return cookieValue; 
        },
            
        /**
         * 创建或设置key-value格式的cookie,同一个cookie名，放置多个名值对。
         * @example right=a=1&b=2
         * */
        setPartCookie: function(/*String*/name,/*String*/partName,/*String*/value,/*Number?*/days, /*String?*/path,/*String?*/domain,/*boolean?*/secure){
            var cookie = this.getCookie(name);
            if(cookie)
            {
                var pairs = cookie.split("&");
                var len = pairs.length;
                var cookieNames = new Array(len);
                var cookieValues = new Array(len);
                var targetIdx = -1;
                for(var i = 0; i < len; i++){
                    var pair = pairs[i].split("=");
                    cookieNames[i] = pair[0];
                    cookieValues[i] = pair[1];
    
                    if(pair[0] == partName){
                        targetIdx = i ;
                    }
                }
    
                if(targetIdx == -1){
                    cookieNames[len] = partName;
                    cookieValues[len++] = value != null ? escape(value) : null;
                }else{
                    cookieValues[targetIdx] = value != null ? escape(value) : null;
                }
    
                var cookieValue = "";
                if(len > 0){
                    for(var j = 0; j < len; j++){
                        if(cookieValues[j] != null){
                            cookieValue += "&" + cookieNames[j] + "=" + cookieValues[j];
                        }
                    }
                    cookieValue = cookieValue.substr(1);
                }
                if(cookieValue == ""){ cookieValue = null;}
    
                this.setCookie(name,cookieValue,days,path,domain,secure);
            } else {
                if(value != null){
                    var cookieValue = partName + "=" + escape(value);
                    this.setCookie(name,cookieValue,days,path,domain,secure);
                }
            }
    
            return null;
        },
        
        /*得到key-value格式的cookie值*/
        getPartCookie: function(/*String*/name,/*String*/partName){
            var cookie = this.getCookie(name);
            if(cookie){
                var pairs = cookie.split("&");
                for(var i = 0; i < pairs.length; i++){
                    var pair = pairs[i].split("=");
                    if(pair[0] == partName){
                        var value = pair[1];
                        value = unescape(value);
                        return value;
                    }
                }
            }
    
            return null;
        }
    };
    
    return cookie;
});