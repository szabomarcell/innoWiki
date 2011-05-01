innoWiki.widgets.add("jump",
	new innoWiki.widgets.BoxContent(
	'Recently Visited',
	'<div id="innowiki_navigation_div"></div> \
	<input type="text" id="input_jumpto" value="jump to..." autocomplete="off" />'
));


innoWiki.navigation = {

load: function( name ){
		$.historyLoad(name);
	},

loadWithNoHistory: function( name ){
		this.pageHistory.put("HomePage");
		this.pageHistory.put(name);
		
		var div = $("#innowiki_navigation_div");
		div.html(this.pageHistory.getHTML());
		$("a",div).click(function(e){innoWiki.navigation.go(this.href); e.preventDefault();});
		
		innoWiki.frontend.loadSave.load(name);
	},
	
historyChange: function (newLocation, historyData){
		//alert("change");
		innoWiki.navigation.loadWithNoHistory(decodeURIComponent(newLocation));
	},


go: function (where){
		//alert("go");
		innoWiki.ui.linkInfo.hideNow();
		innoWiki.ui.alerter.clearAlerts();
		if(innoWiki.urlExaminer.isWikiPage(where) ){
			this.load(innoWiki.urlExaminer.getPageName(where));
		} else {
			location.href = where;
		}
	},


pageHistory: {
	list:			new Object(),
	latestID:		0,
	historyLength:	10,
	
	put:			function (name){
			this.list[name] = this.latestID++;
		},
	
	getHTML:		function (){
			var list = this.list;
			var ret = "<ul>";
			for(var i in list){
				if(list[i] > this.latestID - this.historyLength){
					ret += '<li'+ (list[i]>=this.latestID-3 && list[i]!=this.latestID-1 ? ' class="history_last"' : '')
					+'><a href="#'+i+'">'+i+'</a></li> ';
				}
			}
			ret += "</ul>";
			return ret;
		}
	
}

}