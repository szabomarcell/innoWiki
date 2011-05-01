innoWiki.events.Startup.add(function(){
		innoWiki.ui.searchResultBox.init();
});

innoWiki.ui.searchResultBox = {
	//div;
	//selectCallback;
	//acceptCallback;
	//resultList;
	//filter;
	selected: 0,
	mouseOverPage: false,
			
	init:	function (){
		
			var div = this.div = document.createElement("div");
			div.id = "div_searchRes";
			document.body.appendChild(div);
			
			$(div).mouseover( function(e){ 
				innoWiki.ui.searchResultBox.mouseOverPage=true;
			});

			$(div).mouseout( function(e){ 
				var reltg = (e.relatedTarget) ? e.relatedTarget : e.toElement; //browser compatiblitiy
				//if the mouse didn't really go OUT, but in a child then exit.
				while (reltg.tagName != 'BODY'){ 
				if (reltg.id == this.id){return;} 
				reltg = reltg.parentNode; 
				} 
				
				// mouse really left the div 
				innoWiki.ui.searchResultBox.mouseOverPage=false;
			});
			
		},

		
	show: function (position, selectCallback, acceptCallback){
		this.selectCallback = selectCallback;
		this.acceptCallback = acceptCallback;
		this.div.style.top = position.top + "px";
		this.div.style.left = position.left + "px";
		this.div.style.display = "block";
		},

	hideIfNotMouseOver: function (){
		if( ! this.mouseOverPage) this.hide();
		},
	
	hide: function (){
		 $(this.div).hide();
		},

	setFilter: function (filter){
			if(filter != this.filter){
				this.filter = filter;
				this.resultList = new Array();
				var f = new RegExp();
				f.compile(filter, "i");
				
				var list = innoWiki.backend.pages.list;
				
				for(var title in list){
					if(title.match(f) || (list[title].summary && list[title].summary.match(f))){
						this.resultList.push( list[title] );
					}
				}
				this.resultList.sort( function (a,b){
							return (a.title < b.title? -1 : 1);
						});
				
				
				if( ( ! list[filter]) && ( filter != "" ) ){
					this.resultList.unshift( new innoWiki.classes.CustomItem(filter));
				}
				
				s = "<table>";
				for(var i=0; i<this.resultList.length; i++){
					s += "<tbody id='resultListItem" + i + "'  onmouseover='innoWiki.ui.searchResultBox.moveSelectionTo(" + i + ")' onclick='innoWiki.ui.searchResultBox.accept()'>" + this.resultList[i].getHTML() + "</tbody>";
					//debugpp(this.resultList[i].title + " " + this.resultList[i].summary);
				}
				s += "</table>";
				
				this.div.innerHTML = s;

				this.moveSelectionTo(0);
			}
		},
		
	accept: function (){
		this.selectCallback(this.resultList[this.selected].title);
		this.hide();
		this.acceptCallback();
		},

	moveSelectionBy: function (step){
		this.moveSelectionTo((this.selected + this.resultList.length + step) % this.resultList.length);
		this.selectCallback(this.resultList[this.selected].title);
		},
		
	moveSelectionTo: function (index){
		$("#resultListItem"+this.selected).removeClass("selected");
		this.selected = index;
		$("#resultListItem"+this.selected).addClass("selected");
		}
}