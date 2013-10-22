define(function(){
   /**
        A module that says hello!
        @exports core/Base
     */
    var Base = {
        /**
        * A reusable empty function
        * @property
         * @type Function
        */
        emptyFn : function(){},
        
        /**
		 * Copies all the properties of config to obj.
		 * @param {Object} obj The receiver of the properties
		 * @param {Object} config The source of the properties
		 * @param {Object} defaults A different object that will also be applied for default values
		 * @return {Object} returns obj
		 */
        apply: function(o, c, defaults){
		    if(defaults){
		        // no "this" reference for friendly out of scope calls
		        Base.apply(o, defaults);
		    }
		    if(o && c && typeof c == 'object'){
		        for(var p in c){
		            o[p] = c[p];
		        }
		    }
		    return o;
		},
        /**
         * Copies all the properties of config to obj if they don't already exist.
         * @param {Object} obj The receiver of the properties
         * @param {Object} config The source of the properties
         * @return {Object} returns obj
         */
        applyIf : function(o, c){
            if(o && c){
                for(var p in c){
                    if(typeof o[p] == "undefined"){ o[p] = c[p]; }
                }
            }
            return o;
        },
        /**
         * * @param {Function} subclass The class inheriting the functionality
         * @param {Function} superclass The class being extended
         * @param {Object} overrides (optional) A literal with members which are copied into the subclass's
         * prototype, and are therefore shared between all instances of the new class.
         * @return {Function} The subclass constructor.
         * @method extend
         */
        extend : function(){
            // inline overrides
            var io = function(o){
                for(var m in o){
                    this[m] = o[m];
                }
            };
            var oc = Object.prototype.constructor;

            return function(sb, sp, overrides){
                if(typeof sp == 'object'){
                    overrides = sp;
                    sp = sb;
                    sb = overrides.constructor != oc ? overrides.constructor : function(){sp.apply(this, arguments);};
                }
                var F = function(){}, sbp, spp = sp.prototype;
                F.prototype = spp;
                sbp = sb.prototype = new F();
                sbp.constructor=sb;
                sb.superclass=spp;
                if(spp.constructor == oc){
                    spp.constructor=sp;
                }
                sb.override = function(o){
                    Base.override(sb, o);
                };
                sbp.override = io;
                Base.override(sb, overrides);
                sb.extend = function(o){Base.extend(sb, o);};
                return sb;
            };
        }(),
        /** 
         * @param {Object} origclass The class to override
         * @param {Object} overrides The list of functions to add to origClass.  This should be specified as an object literal
         * containing one or more methods.
         * @method override
         */
        override : function(origclass, overrides){
            if(overrides){
                var p = origclass.prototype;
                for(var method in overrides){
                    p[method] = overrides[method];
                }
//                if(Ext.isIE && overrides.toString != origclass.toString){
//                    p.toString = overrides.toString;
//                }
            }
        },
        /**
         * Returns true if the passed object is a JavaScript array, otherwise false.
         * @param {Object} object The object to test
         * @return {Boolean}
         */
        isArray : function(v){
            return v && typeof v.length == 'number' && typeof v.splice == 'function';
        },
        /**
         * Creates namespaces to be used for scoping variables and classes so that they are not global.  Usage:
         * <pre><code>
			Base.namespace('Company', 'Company.data');
			Company.Widget = function() { ... }
			Company.data.CustomStore = function(config) { ... }
			</code></pre>
         * @param {String} namespace1
         * @param {String} namespace2
         * @param {String} etc
         * @method namespace
         */
        namespace : function(){
            var a=arguments, o=null, i, j, d, rt;
            for (i=0; i<a.length; ++i) {
                d=a[i].split(".");
                rt = d[0];
                eval('if (typeof ' + rt + ' == "undefined"){' + rt + ' = {};} o = ' + rt + ';');
                for (j=1; j<d.length; ++j) {
                    o[d[j]]=o[d[j]] || {};
                    o=o[d[j]];
                }
            }
        },
        counter: 0,
        id: function(pre){
            return (pre || "shawn_id_") + this.counter++;
        }
    };
	if(!window.console){
	    window.console = {log: function(){}};
	}
    return Base;
});