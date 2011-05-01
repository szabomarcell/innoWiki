innoWiki.events.Startup.add(function(){
		innoWiki.backend.users.refresh();
		innoWiki.backend.pages.refresh();
		innoWiki.backend.startRefreshInterval();
});

innoWiki.events.BeforeSave.add(function(){
	innoWiki.backend.stopRefreshInterval();
});

innoWiki.events.PageLoaded.add(function(){
	innoWiki.backend.startRefreshInterval();
});
			
			
			
innoWiki.backend = {

//TODO
connection: new SharePointConnection(),

refreshHandler: 0,

stopRefreshInterval: function(){
	clearInterval(this.refreshHandler);
},

startRefreshInterval: function(){
	this.stopRefreshInterval();
	this.refreshHandler = setInterval(
		function(){
			try{innoWiki.backend.pages.refresh()}
			catch(e){}
		},
		2000);
},

pages: {
		list:		new Object(),
		loaded:		null,
		lastId: 	0,

		load: function (title){
				if( ! this.list[title] ){
					var page = new innoWiki.classes.PageListItem();
					page.title = title;
					//TODO
					page.summary = "Please give a descriptive summary!";
					page.content = "This page didn't exist until now. Start writing! ;)";
					this.list[title] = page;
				}
				this.loaded = this.list[title];
		},
		
		save: function (){ //throws exception if editing conflict
			this.refresh();
			innoWiki.backend.connection.save(this.loaded);
		},

		refresh: function (){
			if( this.lastId == 0 ){
			//initial pagelist download from the active page list
				this.lastId = innoWiki.backend.connection.getLastHistoryId();
				var pages = innoWiki.backend.connection.getActivePageList();
				for(var i=0; i<pages.length; i++){
					this.list[pages[i].title] = pages[i];
				}
			} else {
			//just the new pages
				var pages = innoWiki.backend.connection.getPagesFromHistoryNewerThan(this.lastId);
				var old, fresh;
				//debugpp("refresh: " + (new Date()) + " - " + pages.length + " new");
				for(var i=0; i<pages.length; i++){
					fresh = pages[i];
					this.lastId = fresh.id;
					//debugpp(fresh.title);
					old = this.list[fresh.title];
					if( old ){
					//page existed before
						//alert(old.historyId + " " + fresh.id);
						if(old.historyId != fresh.id){ //not our modification
							old.clearContent();
						}
						old.summary = fresh.summary;
						old.editor = fresh.editor;
						old.date = fresh.date;
					} else {
					//new page
						this.list[fresh.title] = fresh;
						fresh.id = null; //this is the historyList ID, but we need the activeList ID
					}
				}
				if(this.loaded && ( ! this.loaded.content)){
					innoWiki.frontend.conflictHandler.run();
					throw("conflict");
				}
			}
		}
	},
	
	
users: {
		listById:		new Object(),
		listByLogin:	new Object(),
		current:		new innoWiki.classes.UserItem(),
		
		refresh:	function (){
			this.listById = innoWiki.backend.connection.getUserlist();
			this.listByLogin = new Object();
			for(var id in this.listById){
				if(this.listById[id].login) {
					this.listByLogin[this.listById[id].login] = this.listById[id];
				}
			}
			this.current = this.listByLogin[innoWiki.backend.connection.getCurrentUserLogin()];
		}
	}

}