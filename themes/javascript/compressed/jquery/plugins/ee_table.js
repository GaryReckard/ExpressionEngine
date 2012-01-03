(function(e){function g(a){this.size=0;this.limit=a;this.cache=[];this.cache_map=[]}function h(a,b){var c=this;this.els=e("p."+a.uniqid);this.template_id=a.uniqid+"_pag_template";e.template(this.template_id,a.pagination);this.els.delegate("a","click",function(){var a=c._extract_qs(this.href,b.options.base_url);b.add_filter(a);return!1})}function i(a,b){var c=this;this.sort=[];this.plugin=b;this.headers=b.element.find("th");this.css={asc:a.cssAsc,desc:a.cssDesc};this.header_map={};this._initial_sort=
a.sort;if(a.pagination){this.headers.each(function(){var b=e(this),d=b.data("table_column");c.header_map[d]=b;b.data("sortable",a.columns[d].sort)});b.element.find("thead").delegate("th","selectstart",function(){return!1}).delegate("th","click",function(b){var d=e(this);if(d.has("input").length)return!0;if(!d.data("sortable"))return!1;c[b.shiftKey?"add":"set"](d.data("table_column"),d.hasClass(a.cssAsc)?"desc":"asc");return!1});for(var d=this._initial_sort.length;d--;)this.sort.push(this._initial_sort[d]),
this.header_map[this._initial_sort[d][0]].toggleClass(this.css.asc,this._initial_sort[d][1]==="asc").toggleClass(this.css.desc,this._initial_sort[d][1]==="desc")}else e(b.element).tablesorter()}e.widget("ee.table",{_listening:e(),_template_string:"",_current_data:{},options:{uniqid:null,base_url:null,pagination:null,template:null,pag_template:null,rows:[],sort:[],columns:[],cache_limit:600,filters:{},cssAsc:"headerSortDown",cssDesc:"headerSortUp"},_create:function(){var a=this.options;this.tbody=
this.element.find("tbody");if(!this.tbody.size())this.tbody=e("<tbody/>"),this.element.append(this.tbody);this.no_results=e("<div />").html(a.no_results);this.tbody.children().length||(this.element.hide(),this.element.after(this.no_results));this.filters=a.filters;a.base_url=a.base_url.replace(RegExp("&amp;","g"),"&");this.sort=new i(a,this);this.cache=new g(a.cache_limit);this.pagination=new h(a,this);var b=this._prep_for_cache(),c={html_rows:this.tbody.find("tr"),pagination:this.pagination.html(),
rows:a.rows};this.cache.set(b,c);this._current_data=c;this.template_id=a.uniqid+"_row_template";this.set_template(a.template);this._trigger("create",null,this._ui({data:c}))},get_container:function(){return this.tbody},set_container:function(a){this.tbody=e(a)},get_template:function(){return this._template_string},set_template:function(a){this._template_string=a;e.template(this.template_id,a)},get_current_data:function(){return this._current_data},clear_cache:function(){this.cache.clear();return this},
clear_filters:function(){this.filters={};this._listening.each(function(){e(this).unbind("interact.ee_table")});return this},clear_sort:function(){this.sort.reset();return this},add_filter:function(a){var b=this,c=EE.BASE+"&"+b.options.base_url;if(e.isPlainObject(a))return b._set_filter(b._listening),b.filters=e.extend(b.filters,a),b._request(c),this;var d=a.closest("form"),f="interact.ee_table",j;d&&a.is(d)&&(f+=" submit.ee_table");e(a).bind(f,function(){clearTimeout(j);j=setTimeout(function(){b._set_filter(b._listening);
b._request(c)},200);return!1});b._listening=b._listening.add(a);return this},set_sort:function(a,b){this.sort.set(a,b);return this},add_sort:function(a,b){this.sort.add(a,b);return this},refresh:function(){this._request(EE.BASE+"&"+this.options.base_url);return this},_request:function(a){var b=this,c,d;b._trigger("load",null,b._ui());d=function(a){b._current_data=a;a.rows.length?(b.element.show(),b.tbody.html(a.html_rows),b.no_results.remove()):b.tbody.is("tbody")?(b.element.hide(),b.element.after(b.no_results)):
b.tbody.html(b.no_results);b.pagination.update(a.pagination);b._trigger("update",null,b._ui({data:a}))};var f=b._prep_for_cache();c=b.cache.get(f);if(c!==null)return d(c);b.filters.tbl_offset&&(a+="&tbl_offset="+b.filters.tbl_offset,delete b.filters.tbl_offset);b.filters.XID=EE.XID;e.ajax(a,{type:"post",data:b.filters,success:function(a){a.html_rows=e.tmpl(b.template_id,a.rows);a.pagination=b.pagination.parse(a.pagination);b.cache.set(f,a,a.rows.length);d(a)},dataType:"json"})},_prep_for_cache:function(){this.filters.tbl_sort=
this.sort.get();var a,b=/^(XID|S|D|C|M)$/,c=[];for(a in this.filters)this.filters[a]==""||b.exec(a)!==null?delete this.filters[a]:c.push(a,this.filters[a]);c.sort();return c.join("")},_set_filter:function(a){var a=a.serializeArray(),b=this;e.each(a,function(){b.filters[this.name]=this.value})},_ui:function(a){a=a||{};return e.extend({sort:this.sort.get(),filters:this.filters},a)}});g.prototype={limit:function(){return this.limit},size:function(){return this.cache.length},set:function(a,b,c){for(c=
c||1;this.size+c>this.limit;){var d=this.cache.shift();this.cache_map.shift();this.size-=d[2]}this.cache.push([a,b,c]);this.cache_map.push(a);this.size+=c;return this},get:function(a){var b=this._find(a);return b>-1?(a=this.cache.splice(b,1)[0],this.cache.push(a),this.cache_map.splice(b,1),this.cache_map.push(a[0]),a[1]):null},"delete":function(a){var b=this._find(a);b>-1&&(a=this.cache.splice(b,1),this.cache_map.splice(b,1),this.size-=a[2]);return this},clear:function(){this.size=0;this.cache=[];
this.cache_map=[];return this},_find:function(a){if(!Array.prototype.indexOf){for(var b=this.cache_map,c=b.length,d=0;d<c;d++)if(b[d]==a)return d;return-1}return this.cache_map.indexOf(a)}};h.prototype={parse:function(a){return!a?"":e.tmpl(this.template_id,a).html()},update:function(a){a?this.els.html(a).show():this.els.html("")},html:function(){return this.els.html()},_qs_splitter:RegExp("([^&=]+)=?([^&]*)","g"),_extract_qs:function(a,b){var a=a.replace(b,""),c;c=a.indexOf("?");var d={};for(c>0&&
(a=a.slice(c+1));c=this._qs_splitter.exec(a);)d[decodeURIComponent(c[1])]=decodeURIComponent(c[2]);return d}};i.prototype={get:function(a){if(a){for(var b=this.sort.length;b--;)if(this.sort[b][0]==a)return this.sort[b][1];return null}return this.sort},add:function(a,b){var c=a,d;b&&(c=[[a,b]]);for(d=c.length;d--;)this.sort.push(c[d]),this.header_map[c[d][0]].toggleClass(this.css.asc,c[d][1]==="asc").toggleClass(this.css.desc,c[d][1]==="desc");this.plugin.refresh();return this},set:function(a,b){this.clear();
this.add(a,b);this.plugin.refresh();return this},reset:function(){this.clear();this.set(this._initial_sort);this.plugin.refresh();return this},clear:function(){for(var a=this.sort.length;a--;)this.header_map[this.sort[a][0]].removeClass(this.css.asc+" "+this.css.desc);this.sort=[];return this}}})(jQuery);
