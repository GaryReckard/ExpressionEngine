(function(a){var l,q,s,e,y,i,u,v,w,n=0,d={},o=[],m=0,b={},f=[],z=null,p=new Image,C=/\.(jpg|gif|png|bmp|jpeg)(.*)?$/i,N=/[^\.]\.(swf)\s*$/i,D,E=1,j,k,h=!1,t=a.extend(a("<div/>")[0],{prop:0}),r=0,K=!a.support.opacity&&!window.XMLHttpRequest,F=function(){q.hide();p.onerror=p.onload=null;z&&z.abort();l.empty()},L=function(){a.fancybox('<p id="fancybox_error">The requested content cannot be loaded.<br />Please try again later.</p>',{scrolling:"no",padding:20,transitionIn:"none",transitionOut:"none"})},
G=function(){return[a(window).width(),a(window).height(),a(document).scrollLeft(),a(document).scrollTop()]},O=function(){var c=G(),a={},A=b.margin,e=b.autoScale,h=(20+A)*2,i=(20+A)*2,f=b.padding*2;b.width.toString().indexOf("%")>-1?(a.width=c[0]*parseFloat(b.width)/100-40,e=!1):a.width=b.width+f;b.height.toString().indexOf("%")>-1?(a.height=c[1]*parseFloat(b.height)/100-40,e=!1):a.height=b.height+f;if(e&&(a.width>c[0]-h||a.height>c[1]-i))d.type=="image"||d.type=="swf"?(h+=f,i+=f,e=Math.min(Math.min(c[0]-
h,b.width)/b.width,Math.min(c[1]-i,b.height)/b.height),a.width=Math.round(e*(a.width-f))+f,a.height=Math.round(e*(a.height-f))+f):(a.width=Math.min(a.width,c[0]-h),a.height=Math.min(a.height,c[1]-i));a.top=c[3]+(c[1]-(a.height+40))*0.5;a.left=c[2]+(c[0]-(a.width+40))*0.5;if(b.autoScale===!1)a.top=Math.max(c[3]+A,a.top),a.left=Math.max(c[2]+A,a.left);return a},P=function(a){if(a&&a.length)switch(b.titlePosition){case "inside":return a;case "over":return'<span id="fancybox-title-over">'+a+"</span>";
default:return'<span id="fancybox-title-wrap"><span id="fancybox-title-left"></span><span id="fancybox-title-main">'+a+'</span><span id="fancybox-title-right"></span></span>'}return!1},Q=function(){var c=b.title,g=k.width-b.padding*2,d="fancybox-title-"+b.titlePosition;a("#fancybox-title").remove();r=0;if(b.titleShow!==!1&&(c=a.isFunction(b.titleFormat)?b.titleFormat(c,f,m,b):P(c))&&c!==""){a('<div id="fancybox-title" class="'+d+'" />').css({width:g,paddingLeft:b.padding,paddingRight:b.padding}).html(c).appendTo("body");
switch(b.titlePosition){case "inside":r=a("#fancybox-title").outerHeight(!0)-b.padding;k.height+=r;break;case "over":a("#fancybox-title").css("bottom",b.padding);break;default:a("#fancybox-title").css("bottom",a("#fancybox-title").outerHeight(!0)*-1)}a("#fancybox-title").appendTo(y).hide()}},R=function(){a(document).unbind("keydown.fb").bind("keydown.fb",function(c){c.keyCode==27&&b.enableEscapeButton?(c.preventDefault(),a.fancybox.close()):c.keyCode==37?(c.preventDefault(),a.fancybox.prev()):c.keyCode==
39&&(c.preventDefault(),a.fancybox.next())});a.fn.mousewheel&&(e.unbind("mousewheel.fb"),f.length>1&&e.bind("mousewheel.fb",function(c,b){c.preventDefault();h||b===0||(b>0?a.fancybox.prev():a.fancybox.next())}));b.showNavArrows&&((b.cyclic&&f.length>1||m!==0)&&v.show(),(b.cyclic&&f.length>1||m!=f.length-1)&&w.show())},H=function(){i.css("overflow",b.scrolling=="auto"?b.type=="image"||b.type=="iframe"||b.type=="swf"?"hidden":"auto":b.scrolling=="yes"?"auto":"visible");a.support.opacity||(i.get(0).style.removeAttribute("filter"),
e.get(0).style.removeAttribute("filter"));a("#fancybox-title").show();if(b.hideOnContentClick)i.one("click",a.fancybox.close);if(b.hideOnOverlayClick)s.one("click",a.fancybox.close);b.showCloseButton&&u.show();R();a(window).bind("resize.fb",a.fancybox.center);b.centerOnScroll?a(window).bind("scroll.fb",a.fancybox.center):a(window).unbind("scroll.fb");if(a.isFunction(b.onComplete))b.onComplete(f,m,b);h=!1;var c,g;if(f.length-1>m&&(c=f[m+1].href,typeof c!=="undefined"&&c.match(C)))g=new Image,g.src=
c;if(m>0&&(c=f[m-1].href,typeof c!=="undefined"&&c.match(C)))g=new Image,g.src=c},I=function(a){var g=Math.round(j.width+(k.width-j.width)*a),d=Math.round(j.height+(k.height-j.height)*a);e.css({width:g+"px",height:d+"px",top:Math.round(j.top+(k.top-j.top)*a)+"px",left:Math.round(j.left+(k.left-j.left)*a)+"px"});g=Math.max(g-b.padding*2,0);d=Math.max(d-(b.padding*2+r*a),0);i.css({width:g+"px",height:d+"px"});typeof k.opacity!=="undefined"&&e.css("opacity",a<0.5?0.5:a)},M=function(){var c=d.orig?a(d.orig):
!1,g={};c&&c.length?(g=c.offset(),g.top+=parseFloat(c.css("paddingTop"))||0,g.left+=parseFloat(c.css("paddingLeft"))||0,g.top+=parseFloat(c.css("border-top-width"))||0,g.left+=parseFloat(c.css("border-left-width"))||0,g.width=c.width(),g.height=c.height(),g={width:g.width+b.padding*2,height:g.height+b.padding*2,top:g.top-b.padding-20,left:g.left-b.padding-20}):(c=G(),g={width:1,height:1,top:c[3]+c[1]*0.5,left:c[2]+c[0]*0.5});return g},J=function(){q.hide();if(e.is(":visible")&&a.isFunction(b.onCleanup)&&
b.onCleanup(f,m,b)===!1)a.event.trigger("fancybox-cancel"),h=!1;else{f=o;m=n;b=d;i.get(0).scrollTop=0;i.get(0).scrollLeft=0;if(b.overlayShow){if(K)a("select:not(#fancybox-tmp select)").filter(function(){return this.style.visibility!=="hidden"}).css({visibility:"hidden"}).one("fancybox-cleanup",function(){this.style.visibility="inherit"});s.css({"background-color":b.overlayColor,opacity:b.overlayOpacity}).unbind().show()}k=O();Q();if(e.is(":visible")){a(u.add(v).add(w)).hide();var c=e.position(),g;
j={top:c.top,left:c.left,width:e.width(),height:e.height()};g=j.width==k.width&&j.height==k.height;i.fadeOut(b.changeFade,function(){var c=function(){i.html(l.contents()).fadeIn(b.changeFade,H)};a.event.trigger("fancybox-change");i.empty().css("overflow","hidden");g?(i.css({top:b.padding,left:b.padding,width:Math.max(k.width-b.padding*2,1),height:Math.max(k.height-b.padding*2-r,1)}),c()):(i.css({top:b.padding,left:b.padding,width:Math.max(j.width-b.padding*2,1),height:Math.max(j.height-b.padding*
2,1)}),t.prop=0,a(t).animate({prop:1},{duration:b.changeSpeed,easing:b.easingChange,step:I,complete:c}))})}else if(e.css("opacity",1),b.transitionIn=="elastic"){j=M();i.css({top:b.padding,left:b.padding,width:Math.max(j.width-b.padding*2,1),height:Math.max(j.height-b.padding*2,1)}).html(l.contents());e.css(j).show();if(b.opacity)k.opacity=0;t.prop=0;a(t).animate({prop:1},{duration:b.speedIn,easing:b.easingIn,step:I,complete:H})}else i.css({top:b.padding,left:b.padding,width:Math.max(k.width-b.padding*
2,1),height:Math.max(k.height-b.padding*2-r,1)}).html(l.contents()),e.css(k).fadeIn(b.transitionIn=="none"?0:b.speedIn,H)}},B=function(){l.width(d.width);l.height(d.height);if(d.width=="auto")d.width=l.width();if(d.height=="auto")d.height=l.height();J()},x=function(){F();var c=o[n],b,e,f,j,k;d=a.extend({},a.fn.fancybox.defaults,typeof a(c).data("fancybox")=="undefined"?d:a(c).data("fancybox"));f=c.title||a(c).title||d.title||"";if(c.nodeName&&!d.orig)d.orig=a(c).children("img:first").length?a(c).children("img:first"):
a(c);f===""&&d.orig&&(f=d.orig.attr("alt"));b=c.nodeName&&/^(?:javascript|#)/i.test(c.href)?d.href||null:d.href||c.href||null;if(d.type){if(e=d.type,!b)b=d.content}else d.content?e="html":b?b.match(C)?e="image":b.match(N)?e="swf":a(c).hasClass("iframe")?e="iframe":b.match(/#/)?(c=b.substr(b.indexOf("#")),e=a(c).length>0?"inline":"ajax"):e="ajax":e="inline";d.type=e;d.href=b;d.title=f;if(d.autoDimensions&&d.type!=="iframe"&&d.type!=="swf")d.width="auto",d.height="auto";if(d.modal)d.overlayShow=!0,
d.hideOnOverlayClick=!1,d.hideOnContentClick=!1,d.enableEscapeButton=!1,d.showCloseButton=!1;if(a.isFunction(d.onStart)&&d.onStart(o,n,d)===!1)h=!1;else switch(l.css("padding",20+d.padding+d.margin),a(".fancybox-inline-tmp").unbind("fancybox-cancel").bind("fancybox-change",function(){a(this).replaceWith(i.children())}),e){case "html":l.html(d.content);B();break;case "inline":a('<div class="fancybox-inline-tmp" />').hide().insertBefore(a(c)).bind("fancybox-cleanup",function(){a(this).replaceWith(i.children())}).bind("fancybox-cancel",
function(){a(this).replaceWith(l.children())});a(c).appendTo(l);B();break;case "image":h=!1;a.fancybox.showActivity();p=new Image;p.onerror=function(){L()};p.onload=function(){p.onerror=null;p.onload=null;h=!0;d.width=p.width;d.height=p.height;a("<img />").attr({id:"fancybox-img",src:p.src,alt:d.title}).appendTo(l);J()};p.src=b;break;case "swf":j='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="'+d.width+'" height="'+d.height+'"><param name="movie" value="'+b+'"></param>';k="";
a.each(d.swf,function(a,c){j+='<param name="'+a+'" value="'+c+'"></param>';k+=" "+a+'="'+c+'"'});j+='<embed src="'+b+'" type="application/x-shockwave-flash" width="'+d.width+'" height="'+d.height+'"'+k+"></embed></object>";l.html(j);B();break;case "ajax":c=b.split("#",2);e=d.ajax.data||{};if(c.length>1)b=c[0],typeof e=="string"?e+="&selector="+c[1]:e.selector=c[1];h=!1;a.fancybox.showActivity();z=a.ajax(a.extend(d.ajax,{url:b,data:e,error:L,success:function(a){z.status==200&&(l.html(a),B())}}));break;
case "iframe":a('<iframe id="fancybox-frame" name="fancybox-frame'+(new Date).getTime()+'" frameborder="0" hspace="0" scrolling="'+d.scrolling+'" src="'+d.href+'"></iframe>').appendTo(l),J()}},S=function(){q.is(":visible")?(a("div",q).css("top",E*-40+"px"),E=(E+1)%12):clearInterval(D)},T=function(){a("#fancybox-wrap").length||(a("body").append(l=a('<div id="fancybox-tmp"></div>'),q=a('<div id="fancybox-loading"><div></div></div>'),s=a('<div id="fancybox-overlay"></div>'),e=a('<div id="fancybox-wrap"></div>')),
a.support.opacity||(e.addClass("fancybox-ie"),q.addClass("fancybox-ie")),y=a('<div id="fancybox-outer"></div>').append('<div class="fancy-bg" id="fancy-bg-n"></div><div class="fancy-bg" id="fancy-bg-ne"></div><div class="fancy-bg" id="fancy-bg-e"></div><div class="fancy-bg" id="fancy-bg-se"></div><div class="fancy-bg" id="fancy-bg-s"></div><div class="fancy-bg" id="fancy-bg-sw"></div><div class="fancy-bg" id="fancy-bg-w"></div><div class="fancy-bg" id="fancy-bg-nw"></div>').appendTo(e),y.append(i=
a('<div id="fancybox-inner"></div>'),u=a('<a id="fancybox-close"></a>'),v=a('<a href="javascript:;" id="fancybox-left"><span class="fancy-ico" id="fancybox-left-ico"></span></a>'),w=a('<a href="javascript:;" id="fancybox-right"><span class="fancy-ico" id="fancybox-right-ico"></span></a>')),u.click(a.fancybox.close),q.click(a.fancybox.cancel),v.click(function(c){c.preventDefault();a.fancybox.prev()}),w.click(function(c){c.preventDefault();a.fancybox.next()}),K&&(s.get(0).style.setExpression("height",
"document.body.scrollHeight > document.body.offsetHeight ? document.body.scrollHeight : document.body.offsetHeight + 'px'"),q.get(0).style.setExpression("top","(-20 + (document.documentElement.clientHeight ? document.documentElement.clientHeight/2 : document.body.clientHeight/2 ) + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop )) + 'px'"),y.prepend('<iframe id="fancybox-hide-sel-frame" src="javascript:\'\';" scrolling="no" frameborder="0" ></iframe>')))};
a.fn.fancybox=function(c){a(this).data("fancybox",a.extend({},c,a.metadata?a(this).metadata():{})).unbind("click.fb").bind("click.fb",function(c){c.preventDefault();if(!h)return h=!0,a(this).blur(),o=[],n=0,c=a(this).attr("rel")||"",!c||c==""||c==="nofollow"?o.push(this):(o=a("a[rel="+c+"], area[rel="+c+"]"),n=o.index(this)),x(),!1});return this};a.fancybox=function(c,b){if(!h){h=!0;var d=typeof b!=="undefined"?b:{};o=[];n=d.index||0;if(a.isArray(c)){for(var e=0,f=c.length;e<f;e++)typeof c[e]=="object"?
a(c[e]).data("fancybox",a.extend({},d,c[e])):c[e]=a({}).data("fancybox",a.extend({content:c[e]},d));o=jQuery.merge(o,c)}else typeof c=="object"?a(c).data("fancybox",a.extend({},d,c)):c=a({}).data("fancybox",a.extend({content:c},d)),o.push(c);if(n>o.length||n<0)n=0;x()}};a.fancybox.showActivity=function(){clearInterval(D);q.show();D=setInterval(S,66)};a.fancybox.hideActivity=function(){q.hide()};a.fancybox.next=function(){return a.fancybox.pos(m+1)};a.fancybox.prev=function(){return a.fancybox.pos(m-
1)};a.fancybox.pos=function(a){h||(a=parseInt(a,10),a>-1&&f.length>a&&(n=a,x()),b.cyclic&&f.length>1&&a<0&&(n=f.length-1,x()),b.cyclic&&f.length>1&&a>=f.length&&(n=0,x()))};a.fancybox.cancel=function(){if(!h){h=!0;a.event.trigger("fancybox-cancel");F();if(d&&a.isFunction(d.onCancel))d.onCancel(o,n,d);h=!1}};a.fancybox.close=function(){function c(){s.fadeOut("fast");e.hide();a.event.trigger("fancybox-cleanup");i.empty();if(a.isFunction(b.onClosed))b.onClosed(f,m,b);f=d=[];m=n=0;b=d={};h=!1}if(!h&&
!e.is(":hidden"))if(h=!0,b&&a.isFunction(b.onCleanup)&&b.onCleanup(f,m,b)===!1)h=!1;else if(F(),a(u.add(v).add(w)).hide(),a("#fancybox-title").remove(),e.add(i).add(s).unbind(),a(window).unbind("resize.fb scroll.fb"),a(document).unbind("keydown.fb"),i.css("overflow","hidden"),b.transitionOut=="elastic"){j=M();var g=e.position();k={top:g.top,left:g.left,width:e.width(),height:e.height()};if(b.opacity)k.opacity=1;t.prop=1;a(t).animate({prop:0},{duration:b.speedOut,easing:b.easingOut,step:I,complete:c})}else e.fadeOut(b.transitionOut==
"none"?0:b.speedOut,c)};a.fancybox.resize=function(){var c,d;!h&&!e.is(":hidden")&&(h=!0,c=i.wrapInner("<div style='overflow:auto'></div>").children(),d=c.height(),e.css({height:d+b.padding*2+r}),i.css({height:d}),c.replaceWith(c.children()),a.fancybox.center())};a.fancybox.center=function(){h=!0;var a=G(),d=b.margin,f={};f.top=a[3]+(a[1]-(e.height()-r+40))*0.5;f.left=a[2]+(a[0]-(e.width()+40))*0.5;f.top=Math.max(a[3]+d,f.top);f.left=Math.max(a[2]+d,f.left);e.css(f);h=!1};a.fn.fancybox.defaults={padding:10,
margin:20,opacity:!1,modal:!1,cyclic:!1,scrolling:"auto",width:560,height:340,autoScale:!0,autoDimensions:!0,centerOnScroll:!1,ajax:{},swf:{wmode:"transparent"},hideOnOverlayClick:!0,hideOnContentClick:!1,overlayShow:!0,overlayOpacity:0.3,overlayColor:"#666",titleShow:!0,titlePosition:"outside",titleFormat:null,transitionIn:"fade",transitionOut:"fade",speedIn:300,speedOut:300,changeSpeed:300,changeFade:"fast",easingIn:"swing",easingOut:"swing",showCloseButton:!0,showNavArrows:!0,enableEscapeButton:!0,
onStart:null,onCancel:null,onComplete:null,onCleanup:null,onClosed:null};a(document).ready(function(){T()})})(jQuery);
