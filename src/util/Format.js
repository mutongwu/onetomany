
define(function(){
    var trimRe = /^\s+|\s+$/g;
    
    function padding(val,len,right,sep){
        var arr = [],
            n = len - String(val).length;
        sep = sep ? sep: 0;
        while(n > 0 && n--){
            arr.push(sep);
        }
        right ? arr.unshift(val) : arr.push(val);
        return arr.join(''); 
    }
    
    
    /**
        基本的格式化工具集。
        @exports util/Format
     */
    var format = {
        /**
         * Truncate a string and add an ellipsis ('...') to the end if it exceeds the specified length
         * @param {String} value The string to truncate
         * @param {Number} length The maximum length to allow before truncating
         * @return {String} The converted text
         */
        ellipsis : function(value, len){
            if(value && value.length > len){
                return value.substr(0, len-3)+"...";
            }
            return value;
        },

        /**
         * Checks a reference and converts it to empty string if it is undefined
         * @param {Mixed} value Reference to check
         * @return {Mixed} Empty string if converted, otherwise the original value
         */
        undef : function(value){
            return value !== undefined ? value : "";
        },

        /**
         * Checks a reference and converts it to the default value if it's empty
         * @param {Mixed} value Reference to check
         * @param {String} defaultValue The value to insert of it's undefined (defaults to "")
         * @return {String}
         */
        defaultValue : function(value, defaultValue){
            return value !== undefined && value !== '' ? value : defaultValue;
        },

        /**
         * Convert certain characters (&, <, >, and ') to their HTML character equivalents for literal display in web pages.
         * @param {String} value The string to encode
         * @return {String} The encoded text
         */
        htmlEncode : function(value){
            return !value ? value : String(value).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
        },

        /**
         * Convert certain characters (&, <, >, and ') from their HTML character equivalents.
         * @param {String} value The string to decode
         * @return {String} The decoded text
         */
        htmlDecode : function(value){
            return !value ? value : String(value).replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        },

        /**
         * Trims any whitespace from either side of a string
         * @param {String} value The text to trim
         * @return {String} The trimmed text
         */
        trim : function(value){
            return String(value).replace(trimRe, "");
        },

        /**
         * Returns a substring from within an original string
         * @param {String} value The original text
         * @param {Number} start The start index of the substring
         * @param {Number} length The length of the substring
         * @return {String} The substring
         */
        substr : function(value, start, length){
            return String(value).substr(start, length);
        },

        /**
         * Converts a string to all lower case letters
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        lowercase : function(value){
            return String(value).toLowerCase();
        },

        /**
         * Converts a string to all upper case letters
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        uppercase : function(value){
            return String(value).toUpperCase();
        },

        /**
         * Converts the first character only of a string to upper case
         * @param {String} value The text to convert
         * @return {String} The converted text
         */
        capitalize : function(value){
            return !value ? value : value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
        },

        // private
        call : function(value, fn){
            if(arguments.length > 2){
                var args = Array.prototype.slice.call(arguments, 2);
                args.unshift(value);
                return eval(fn).apply(window, args);
            }else{
                return eval(fn).call(window, value);
            }
        },

        /**
         * Format a number as US currency
         * @param {Number/String} value The numeric value to format
         * @return {String} The formatted currency string
         */
        usMoney : function(v){
            v = (Math.round((v-0)*100))/100;
            v = (v == Math.floor(v)) ? v + ".00" : ((v*10 == Math.floor(v*10)) ? v + "0" : v);
            v = String(v);
            var ps = v.split('.');
            var whole = ps[0];
            var sub = ps[1] ? '.'+ ps[1] : '.00';
            var r = /(\d+)(\d{3})/;
            while (r.test(whole)) {
                whole = whole.replace(r, '$1' + ',' + '$2');
            }
            v = whole + sub;
            if(v.charAt(0) == '-'){
                return '-$' + v.substr(1);
            }
            return "$" +  v;
        },


        // private
        stripTagsRE : /<\/?[^>]+>/gi,
        
        /**
         * Strips all HTML tags
         * @param {Mixed} value The text from which to strip tags
         * @return {String} The stripped text
         */
        stripTags : function(v){
            return !v ? v : String(v).replace(this.stripTagsRE, "");
        },

        // private
        stripScriptsRe : /(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)/ig,

        /**
         * Strips all script tags
         * @param {Mixed} value The text from which to strip script tags
         * @return {String} The stripped text
         */
        stripScripts : function(v){
            return !v ? v : String(v).replace(this.stripScriptsRe, "");
        },

        /**
         * Simple format for a file size (xxx bytes, xxx KB, xxx MB)
         * @param {Number/String} size The numeric value to format
         * @return {String} The formatted file size
         */
        fileSize : function(size){
            if(size < 1024) {
                return size + " bytes";
            } else if(size < 1048576) {
                return (Math.round(((size*10) / 1024))/10) + " KB";
            } else {
                return (Math.round(((size*10) / 1048576))/10) + " MB";
            }
        },

        math : function(){
            var fns = {};
            return function(v, a){
                if(!fns[a]){
                    fns[a] = new Function('v', 'return v ' + a + ';');
                }
                return fns[a](v);
            };
        }(),

        /**
         * Converts newline characters to the HTML tag &lt;br/>
         * @param {String} The string value to format.
         * @return {String} The string with embedded &lt;br/> tags in place of newlines.
         */
        nl2br : function(v){
            return v === undefined || v === null ? '' : v.replace(/\n/g, '<br/>');
        },
        
        
        isDate: function(dt){
            return dt && typeof dt.getFullYear === 'function';
        },
        isLeapYear: function(dt){
            var year = dt.getFullYear ? dt.getFullYear() : dt;
            if(year%400 === 0 || 
                year%4 === 0 && year%100 !== 0){
                return true;
            }
            return false;
        },
        /**
         * @description 格式化日期
         * 仅支持 YYYY-MM-DD hh:mm:ss 这种形式及它的子集
         * @param {Date} dt 原生日期对象
         * @param {String} format 格式字符串,默认值YYYY-MM-DD hh:mm:ss
         * 
         */
        formatDate: function(dt,format){
            if(this.isDate(dt)){
                var seed = ["YYYY","MM","DD","hh","mm","ss"];
                var idx = 0, sep = "", rs = "";
                format = format ? format:"YYYY-MM-DD hh:mm:ss";
                for(var i=0;i<seed.length;i++){
                    idx = format.indexOf(seed[i],idx);
                    if(idx !== -1){
                        switch(i){
                            case 0: rs += dt.getFullYear(); sep = "-"; break;
                            case 1: rs += sep; 
                                    rs += padding(dt.getMonth()+1,2); break;
                            case 2: rs += sep; sep = " ";
                                    rs += padding(dt.getDate(),2); break;
                            case 3: rs+= sep; sep = ":";
                                    rs += padding(dt.getHours(),2); break;
                            case 4: rs += sep; 
                                    rs += padding(dt.getMinutes(),2); break;
                            case 5: rs += sep;
                                    rs += padding(dt.getSeconds(),2); break;                    
                        }
                    }else{
                        continue;
                    }
                }
                return rs;
            }else{
                return null;
            }            
        },
        
        /**
         * 把字符串解析为日期类型。时分秒必须用：号隔开。字符串的有效格式包括：
         * "2012-09-09 12:13:09","2012-09-09","12:13:09",
         * "2012/09/09","2012年09月09日","19/09/2012"
         * */
        parseDate: function(str){
            var yearReg = /\b(\d{1,4})([^\d]+)(\d{1,2})([^\d]+)(\d{1,4})/;
            var timeReg = /\b(\d{1,2}):(\d{1,2}):(\d{1,2})[^\d+]?(\d{1,3})?/;
            var rsTime = null,
                rsYear = null,
                now = new Date(),
                dt = new Date(1970,1,1,0,0,0,0);

            //时间检测
            rsTime = timeReg.exec(str);
            if(rsTime){
                rsTime[0] = parseInt(rsTime[1],10);
                rsTime[1] = parseInt(rsTime[2],10);
                rsTime[2] = parseInt(rsTime[3],10);
                rsTime[3] = parseInt(rsTime[4]|| 0,10);
            }else{
                rsTime = [0,0,0,0,true];
            }
            dt.setHours(rsTime[0]);
            dt.setMinutes(rsTime[1]);
            dt.setSeconds(rsTime[2]);
            dt.setMilliseconds(rsTime[3]);
            
            //日期检测
            rsYear = yearReg.exec(str);
            if(rsYear && ( rsYear[5].length === 4 || rsYear[1].length === 4)){
                //年份在后
                if(rsYear[5].length === 4){
                    rsYear[0] = parseInt(rsYear[5],10);
                    rsYear[2] = parseInt(rsYear[1],10);
                }else{
                    //年份在前
                    rsYear[0] = parseInt(rsYear[1],10);
                    rsYear[2] = parseInt(rsYear[5],10);
                }
                rsYear[1] = parseInt(rsYear[3],10)-1;
            }else if(rsTime[rsTime.length - 1]){
                return null;
            }else{
                rsYear = [now.getFullYear(),now.getMonth(),now.getDate()];
            }
	        dt.setFullYear(rsYear[0]);
	        dt.setMonth(rsYear[1]);
	        dt.setDate(rsYear[2]);
            
            
            if(dt.getFullYear() === rsYear[0] && 
                dt.getMonth() === rsYear[1] && 
                dt.getDate() === rsYear[2] && 
                dt.getHours() === rsTime[0] && 
                dt.getMinutes() === rsTime[1] && 
                dt.getSeconds() === rsTime[2] ){
                return dt;
            }
            return null;
        }
    
    };  
    return format;
});