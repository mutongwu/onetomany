/**
 * @description 对数据进行本地存储。默认只用于存储基本数据类型。如需存储对象，先用 ui/Json对数据进行字符串化。
 * @author shawn
 * @date 2012-10-15
 * @see http://dev.w3.org/html5/webstorage/
 * 
 * @exception 注意：IE6/7下的userData，无法支持跨目录的数据共享。
 * 
 * 原始localStorage的浏览器支持情况:
 *  Feature         Chrome  Firefox (Gecko)     Internet Explorer   Opera   Safari (WebKit)
	localStorage    4          3.5                 8                 10.50     4
	sessionStorage  5          2                   8                 10.50     4
 */
define(function(){
    var storage =  {
        keyName: "OfflineStorage",
        storageObject: null,
        userDataEnable: true,
        initialize: function() {
            if(!this.userDataEnable){
                return false;
            }
            if (!this.storageObject) {
                this.storageObject = document.createElement("div");
                this.storageObject.addBehavior("#default#userData");
                this.storageObject.style.display = "none";
                document.body.appendChild(this.storageObject);
                try{
                    this.storageObject.load(this.keyName);
                }catch(e){
                    this.userDataEnable = false;
                    return false;
                }
            }
            return true;
        },
        setItem: function(key, value) {
            if(window.localStorage){
                window.localStorage.setItem(key, value);
            }else{
                if (this.userDataEnable && this.initialize()){
                    this.storageObject.setAttribute(key, value);
                    this.storageObject.save(this.keyName);
                }else{
                    return false;
                }                
            }
            return true;
        },
        getItem : function(key){
            if(window.localStorage){
                return window.localStorage.getItem(key);
            }else{
                if (this.userDataEnable && this.initialize()){
                    this.storageObject.load(this.keyName);
                    return this.storageObject.getAttribute(key);
                }else{
                    return null;
                }
            }
        },
        removeItem: function(key) {
            if(window.localStorage){
                window.localStorage.removeItem(key);
            }else{
                if (this.userDataEnable && this.initialize()){
                     this.storageObject.removeAttribute(key);
                     this.storageObject.save(this.keyName);
                     return true;
                }else{
                    return false;
                }
            }
        }
    };
    
    return storage;
});