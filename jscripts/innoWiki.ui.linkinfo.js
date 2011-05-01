innoWiki.events.Startup.add(function(){
		innoWiki.ui.linkInfo.init();
});

innoWiki.events.MceLoaded.add(function(){
		// linkinfo hover
		$("a", innoWiki.frontend.editor.getDoc()).live(
			"mouseover", innoWiki.ui.linkInfo.showInFrame
			).live(
			"mouseout", innoWiki.ui.linkInfo.hide
			);
			
		//TODO
		$("#div_history a").live(
			"mouseover", innoWiki.ui.linkInfo.show
			).live(
			"mouseout", innoWiki.ui.linkInfo.hide
			);
});


innoWiki.ui.linkInfo = {
	mouseOverPage:	false,
	timeoutHandler:	0,

	init: function (){
			var div = this.div = document.createElement("div");
			div.id = "div_linkInfo";
		
			document.body.appendChild(div);
			
			$(div).mouseover(function(e){ 
				clearTimeout(innoWiki.ui.linkInfo.timeoutHandler);
				innoWiki.ui.linkInfo.mouseOverPage=true;
			});

			$(div).mouseout(function(e){ 
				var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement; //browser compatiblitiy
				
				//if the mouse didn't really go OUT, but in a child then exit.
				while (reltg && reltg.tagName && (reltg.tagName.toUpperCase() != 'BODY')){ 
					if (reltg.id == this.id){return;} 
					reltg = reltg.parentNode; 
				} 
				
				// mouse really left the div 
				innoWiki.ui.linkInfo.mouseOverPage=false;
				innoWiki.ui.linkInfo.hide();
			});
		},

	hide: function(){
			clearTimeout(innoWiki.ui.linkInfo.timeoutHandler);
			innoWiki.ui.linkInfo.timeoutHandler = setTimeout(innoWiki.ui.linkInfo.hideIfNotActive, 300);
		},

	hideIfNotActive: function (){
			if( ! innoWiki.ui.linkInfo.mouseOverPage) innoWiki.ui.linkInfo.hideNow();
		},

	hideNow: function (){
			innoWiki.ui.linkInfo.div.style.display = "none";
		},
		
	show:	function (e){
			if( ! e.target ) e.target = e.srcElement; //IE suxx
			var winOffset={
				top:  0,
				left: 0
			};
			innoWiki.ui.linkInfo.showWithWindowOffset(e,winOffset);
		},

	showInFrame: function (e){
			var t = e.target;
			var winOffset   = $(innoWiki.frontend.editor.getContentAreaContainer()).offset();
			winOffset.top  -= $(t.ownerDocument.body).scrollTop();
			winOffset.left -= $(t.ownerDocument.body).scrollLeft();
			innoWiki.ui.linkInfo.showWithWindowOffset(e,winOffset);
		},

	showWithWindowOffset:	function (e, winOffset){

			clearTimeout(innoWiki.ui.linkInfo.timeoutHandler);
			innoWiki.ui.linkInfo.mouseOverPage = false;

			var t = e.target;
		
			var div = innoWiki.ui.linkInfo.div;
			
			div.style.top = Math.round( $(t).offset().top + winOffset.top + $(t).height() ) + "px";
			div.style.left = Math.round( $(t).offset().left + winOffset.left ) + "px";

			
			var s = "<a class='link_go' href='javascript:innoWiki.navigation.go(\"" + t.href + "\")'>" + decodeURI(t.href) + "</a><br/>";
			//s += "<hr style='width: 100px; text-align: left; margin: 0 auto 0 0;'/>";
			
			if(innoWiki.urlExaminer.isWikiPage(t.href) ){
				var title = innoWiki.urlExaminer.getPageName(t.href);
				if(innoWiki.backend.pages.list[title]){
					s += "<table>" + innoWiki.backend.pages.list[title].getHTML() + "</table>";
				} else {
					s += "Create new page named: " + title;
				}
			}
			
			div.innerHTML = s;
			
			div.style.display = "block";
		}

		
}