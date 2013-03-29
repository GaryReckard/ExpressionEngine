/*!
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		EllisLab Dev Team
 * @copyright	Copyright (c) 2003 - 2013, EllisLab, Inc.
 * @license		http://ellislab.com/expressionengine/user-guide/license.html
 * @link		http://ellislab.com
 * @since		Version 2.0
 * @filesource
 */

(function(a){var d,i="",l=0,f={},j="",b=null,k;a.ee_filebrowser=function(){a.ee_filebrowser.endpoint_request("setup",function(e){dir_files_structure={};dir_paths={};d=a(e.manager).appendTo(document.body);for(var c in e.directories)l||(l=c),dir_files_structure[c]="";var g=a("#dir_choice"),e=0.95*a(window).width();974<e&&(e=974);d.dialog({width:e,height:615,resizable:!1,position:["center","center"],modal:!0,draggable:!0,title:EE.filebrowser.window_title,autoOpen:!1,zIndex:99999,open:function(){var c=
f[i].directory;isNaN(c)||g.val(c);g.trigger("interact");a("#dir_choice").val()},close:function(){a.ee_filebrowser.reload();a("#keywords",d).val("")}});a("#file_browser_body").find("table").each(function(){b=a(this);if(b.data("table_config"))return!1});e=b.data("table_config");b.table(e);b.table("add_filter",g);b.table("add_filter",a("#keywords"));var h=b.table("get_template");thumb_template=a("#thumbTmpl").remove().html();table_container=b.table("get_container");thumb_container=a("#file_browser_body");
a("#view_type").change(function(){"thumb"==this.value?(b.detach(),b.table("set_container",thumb_container),b.table("set_template",thumb_template),b.table("add_filter",{per_page:36})):(thumb_container.html(b),b.table("set_container",table_container),b.table("set_template",h),b.table("add_filter",{per_page:15}))});a("#upload_form",d).submit(a.ee_filebrowser.upload_start);a("#file_browser_body",d).addClass("list");"undefined"!=typeof a.ee_fileuploader&&a.ee_fileuploader({type:"filebrowser",open:function(){a.ee_fileuploader.set_directory_id(a("#dir_choice").val())},
close:function(){a("#file_uploader").removeClass("upload_step_2").addClass("upload_step_1");a("#file_browser").size()&&a.ee_filebrowser.reload()},trigger:"#file_browser #upload_form input"})})};a.ee_filebrowser.endpoint_request=function(b,c,d){"undefined"==typeof d&&a.isFunction(c)&&(d=c,c={});c=a.extend(c,{action:b});a.ajax({url:EE.BASE+"&"+EE.filebrowser.endpoint_url,type:"GET",dataType:"json",data:c,cache:!1,success:function(a){a.error?j=a.error:"function"==typeof d&&d.call(this,a)}})};a.ee_filebrowser.add_trigger=
function(b,c,g,h){h?f[c]=g:a.isFunction(c)?(h=c,c="userfile",f[c]={content_type:"any",directory:"all"}):a.isFunction(g)&&(h=g,f[c]={content_type:"any",directory:"all"});a(b).click(function(){if(j)return alert(j),!1;var b=this;i=c;"all"!=f[i].directory?(a("#dir_choice",d).val(f[i].directory),a("#dir_choice_form .dir_choice_container",d).hide()):(a("#dir_choice",d).val(),a("#dir_choice_form .dir_choice_container",d).show());d.dialog("open");k=function(a){h.call(b,a,c)};return!1})};a.ee_filebrowser.get_current_settings=
function(){return f[i]};a.ee_filebrowser.placeImage=function(b){a.ee_filebrowser.endpoint_request("file_info",{file_id:b},function(a){k(a);d.dialog("close")});return!1};a.ee_filebrowser.clean_up=function(b){void 0!=d&&(b&&k(b),a("#keywords",d).val(""),d.dialog("close"))};a.ee_filebrowser.reload_directory=function(){a.ee_filebrowser.reload()};a.ee_filebrowser.reload=function(){b&&(b.table("clear_cache"),b.table("refresh"))}})(jQuery);
