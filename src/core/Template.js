define(['core/Base','util/Format','util/BomHelper'],function(Base,Format,BomHelper){
    
    /**
	 * @module core/Template
	 * Represents an HTML fragment template. Templates can be precompiled for greater performance.
	 * For a list of available format functions, see {@link util/Format}.<br />
	 * Usage:
		<pre><code>
		var t = new Template(
		    '&lt;div name="{id}"&gt;',
		        '&lt;span class="{cls}"&gt;{name:trim} {value:ellipsis(10)} {id:myfn}&lt;/span&gt;',
		    '&lt;/div&gt;'
		);
        t.myfn = function(val,values){
           return val + "XXXX";
        };
		var data = {id: 'myid', cls: 'myclass', name: 'foo', value: 'bar'};
        someElement.innerHTML = t.apply(data);
		</code></pre>
	 * @constructor
	 * @param {String/Array} html The HTML fragment or an array of fragments to join("") or multiple arguments to join("")
	 */
    function Template(html){
        var a = arguments;
	    if(Base.isArray(html)){
	        html = html.join("");
	    }else if(a.length > 1){
	        var buf = [];
	        for(var i = 0, len = a.length; i < len; i++){
	            if(typeof a[i] == 'object'){
	                Base.apply(this, a[i]);
	            }else{
	                buf[buf.length] = a[i];
	            }
	        }
	        html = buf.join('');
	    }
	    /**@private*/
	    this.html = html;
	    if(this.compiled){
	        this.compile();
	    }
    }
    
    Template.prototype = {
	    /**
	     * Returns an HTML fragment of this template with the specified values applied.
	     * @param {Object/Array} values The template values. Can be an array if your params are numeric (i.e. {0}) or an object (i.e. {foo: 'bar'})
	     * @return {String} The HTML fragment
	     */
	    applyTemplate : function(values){
	        if(this.compiled){
	            return this.compiled(values);
	        }
	        var useF = this.disableFormats !== true;
	        var fm = Format, tpl = this;
	        var fn = function(m, name, format, args){
	            if(format && useF){
	                if(format.substr(0, 5) == "this."){
	                    return tpl.call(format.substr(5), values[name], values);
	                }else{
	                    if(args){
	                        // quoted values are required for strings in compiled templates,
	                        // but for non compiled we need to strip them
	                        // quoted reversed for jsmin
	                        var re = /^\s*['"](.*)["']\s*$/;
	                        args = args.split(',');
	                        for(var i = 0, len = args.length; i < len; i++){
	                            args[i] = args[i].replace(re, "$1");
	                        }
	                        args = [values[name]].concat(args);
	                    }else{
	                        args = [values[name]];
	                    }
	                    return fm[format].apply(fm, args);
	                }
	            }else{
	                return values[name] !== undefined ? values[name] : "";
	            }
	        };
	        return this.html.replace(this.re, fn);
	    },
	
	    /**
	     * Sets the HTML used as the template and optionally compiles it.
	     * @param {String} html
	     * @param {Boolean} compile (optional) True to compile the template (defaults to undefined)
	     * @return {core/Template} this
	     */
	    set : function(html, compile){
	        this.html = html;
	        this.compiled = null;
	        if(compile){
	            this.compile();
	        }
	        return this;
	    },
	
	    /**
	     * True to disable format functions (defaults to false)
	     * @type Boolean
	     */
	    disableFormats : false,
	
	    /**
	    * The regular expression used to match template variables
	    * @type RegExp
	    * @property
	    */
	    re : /\{([\w\-]+)(?:\:([\w\.]*)(?:\((.*?)?\))?)?\}/g,
	
	    /**
	     * Compiles the template into an internal function, eliminating the RegEx overhead.
	     * @return {core/Template} this
	     */
	    compile : function(){
	        var useF = this.disableFormats !== true;
            var isGecko = BomHelper.client.engine.gecko > 0;
	        var sep = isGecko ? "+" : ",";
	        var fn = function(m, name, format, args){
	            if(format && useF){
	                args = args ? ',' + args : "";
	                if(format.substr(0, 5) != "this."){
	                    format = "fm." + format + '(';
	                }else{
	                    format = 'this.call("'+ format.substr(5) + '", ';
	                    args = ", values";
	                }
	            }else{
	                args= ''; format = "(values['" + name + "'] == undefined ? '' : ";
	            }
	            return "'"+ sep + format + "values['" + name + "']" + args + ")"+sep+"'";
	        };
	        var body;
	        // branched to use + in gecko and [].join() in others
	        if(isGecko){
	            body = "this.compiled = function(values){ return '" +
	                   this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn) +
	                    "';};";
	        }else{
	            body = ["this.compiled = function(values){ return ['"];
	            body.push(this.html.replace(/\\/g, '\\\\').replace(/(\r\n|\n)/g, '\\n').replace(/'/g, "\\'").replace(this.re, fn));
	            body.push("'].join('');};");
	            body = body.join('');
	        }
	        eval(body);
	        return this;
	    },
	
	    // private function used to call members
	    call : function(fnName, value, allValues){
	        return this[fnName](value, allValues);
	    }
    };
    
    Template.prototype.apply = Template.prototype.applyTemplate;
    
    return Template;
});