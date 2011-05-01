innoWiki = {

frontend: new Object(),
backend: new Object(),
ui: new Object(),
elements: new Object(),

urlExaminer: {
	isWikiPage: function(url){
		return url.split("#")[0]==location.href.split("#")[0];
	},
	getPageName: function(url){
		var pagename = url.split("#")[1];
		if( ! pagename || pagename =="" ) pagename = "HomePage"
		return decodeURI(pagename);
	},
	getPageUrl: function(title){
		return location.href.split("#")[0] + "#" + title;
	}
},

startup: {

	init: function () {

		if(innoWiki.urlExaminer.getPageName(document.location.href)=="HomePage"){
			document.location.hash = "HomePage";
		}
	
		innoWiki.events.MceLoaded.addToTop(function (){
			innoWiki.frontend.editor = tinyMCE.get("wikicontent");

			//TODO: zoom
			$(innoWiki.frontend.editor.getDoc().body).css("font-size","1em");
			
			innoWiki.frontend.editor.onChange.add(function(){
				innoWiki.events.ContentChange.dispatch();
			});
			innoWiki.frontend.editor.onKeyDown.add(function(ed, e){
				innoWiki.events.ContentKeypress.dispatch(ed, e);
			});
			innoWiki.events.PageLoaded.add(function(){
				innoWiki.events.ContentChange.dispatch();
			});			
			
			innoWiki.startup.registerEventhandlers();

			$.historyInit(innoWiki.navigation.historyChange, "jscripts/jquery/blank.html");
		});
		
		innoWiki.events.Startup.dispatch();
		this.editor_init();

	},

	editor_init: function (){

		tinyMCE.init({
			// General options
			mode : "exact",
			elements : "wikicontent",
			theme : "advanced",
			skin : "o2k7",
			plugins : "safari,style,table,layer,save,preview,searchreplace,contextmenu,paste,fullscreen,visualchars,nonbreaking",

			// Theme options
			theme_advanced_buttons1 : "undo,redo,|,formatselect,|,bold,italic,underline,strikethrough,sub,sup,|,hr,charmap",
			theme_advanced_buttons2 : "cut,copy,paste,|,search,replace,|,justifyleft,justifycenter,justifyright,justifyfull,|,bullist,numlist,|,outdent,indent,|,link,unlink,image,|,fullscreen,removeformat,code",
			theme_advanced_buttons3 : "",
			theme_advanced_toolbar_location : "top",
			theme_advanced_toolbar_align : "left",
			theme_advanced_statusbar_location : "bottom",
			theme_advanced_resizing : true,

			save_enablewhendirty : true,
			
			width: "100%",
			height: "100%",

			//TODO
			// Drop lists for link/image/media/template dialogs
			template_external_list_url : "lists/template_list.js",
			external_link_list_url : "lists/link_list.js",
			external_image_list_url : "lists/image_list.js",
			media_external_list_url : "lists/media_list.js",

			content_css : "design/editor.css",
		
			oninit: function(){innoWiki.events.MceLoaded.dispatch()},
			
			// sharepoint needs domain absolute urls
			relative_urls : false,
			remove_script_host : false,
			// this will come automatically:
			//    document_base_url : "http://www.site.com/path1/"
			
			add_form_submit_trigger : false,
			theme_advanced_path : false

			
		});

	},

	registerEventhandlers: function (){

		window.onbeforeunload = function () {
			try{innoWiki.frontend.loadSave.save()}
			catch(e){
				alert("Concurrent edit detected. Please review changes!\nPress Cancel at the next question, or your changes will be lost.");
				return "";
			}
		};

		$(innoWiki.elements.summary).keydown( function (e) {
			switch(e.which){
				case 9: innoWiki.frontend.editor.focus(); e.preventDefault(); break;
			}
		});


		//TODO refactor these into a separate component
		$(innoWiki.elements.jumpto).keydown( function (e) {
			var s = innoWiki.ui.searchResultBox;
			var position = $(this).offset();
			position.top += $(this).height();
			s.show(position, 
				function (title){ innoWiki.elements.jumpto.value = title },
				function (){ 
					innoWiki.navigation.load(innoWiki.elements.jumpto.value);
					innoWiki.elements.jumpto.value="jump to...";
				}
			);
			switch(e.which){
			case 38: s.moveSelectionBy(-1); break;
			case 40: s.moveSelectionBy(1); break;
			case 13: 
				s.hide();
				innoWiki.navigation.load(innoWiki.elements.jumpto.value);
				innoWiki.elements.jumpto.value="jump to...";
				break;
			default: window.setTimeout("innoWiki.ui.searchResultBox.setFilter(innoWiki.elements.jumpto.value);",1);
			}

		});	
		
		$(innoWiki.elements.jumpto).blur( function (e) {
			innoWiki.ui.searchResultBox.hideIfNotMouseOver();
			this.value = "jump to...";
		});	

		$(innoWiki.elements.jumpto).focus( function (e) {
			var position = $(this).offset();
			position.top += $(this).height();
			this.value = "";
			innoWiki.ui.searchResultBox.setFilter(this.value);
			innoWiki.ui.searchResultBox.show(position, 
				function (title){ innoWiki.elements.jumpto.value = title },
				function (){ 
					innoWiki.navigation.load(innoWiki.elements.jumpto.value);
					innoWiki.elements.jumpto.value="jump to...";
				}
			);
		});
		
	}


}


}