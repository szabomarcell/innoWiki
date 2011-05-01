innoWiki.widgets = {
	//Public Classes
	SimpleContent: function(content){
		this.element = $("<div></div>",document);
		this.setContent = function(content){$(this.element).html(content) };
		this.getContent = function(){ return $(this.element).html() };
		this.remove = function(){ this.element.remove() };
		
		this.setContent(content);
	},
	BoxContent: function(title, content){
		this.element = $('<table class="officebox">\
			<tr><td class="topleft"> </td><td class="top"> </td><td class="topright"> </td></tr>				\
			<tr><td class="left"> </td><td class="center"><div> </div></td><td class="right"> </td></tr>		\
			<tr><td class="left"> </td><td class="centerbottom"><div> </div></td><td class="right"> </td></tr>	\
			<tr><td class="bottomleft"> </td><td class="bottom"> </td><td class="bottomright"> </td></tr>		\
		</table>',document);
		this.setContent = function(content){$("div:first",this.element).html(content) };
		this.getContent = function(){ return $("div:first",this.element).html() };
		this.setTitle = function(content){$("div:last",this.element).html(content) };
		this.getTitle = function(){ return $("div:last",this.element).html() };
		this.remove = function(){ this.element.remove() };
		
		this.setContent(content);
		this.setTitle(title);
	},

	list: new Object(),
	add: function(name, widget){this.list[name] = widget},
	get: function(names){
		var arr = names.split(",");
		if(names.length==1) {
			return this.list[names]
		} else {
			var ret = new Array();
			for(var i=0; i<arr.length; i++){
				ret.push(this.list[arr[i]]);
			}
			return ret;
		}
	}
}


		innoWiki.widgets.add("logo",
			new innoWiki.widgets.SimpleContent(
			'<img src="design/innowiki_logo.jpg" /><br/>								\
			<span style="color: red; font-weight: bold; margin-left: 10px">BETA</span>	\
			<span style="">build: 2009.07.15.</span>'
		));
		
		innoWiki.widgets.add("help",
			new innoWiki.widgets.BoxContent(
			'Help (BETA)',
			'<ul><li>To insert a link, type: [[</li>	\
			<li>To create a page, create a new link with the desired name!</li></ul>'
		));

		innoWiki.widgets.add("title",
			new innoWiki.widgets.BoxContent(
			'<div id="div_summary">Summary: <input type="text" id="summary" /></div>',
			'<div id="div_title">[[<input type="text" id="wikititle" disabled="disabled" value=""/>]]</div>'
		));
		
		innoWiki.widgets.add("content",
			new innoWiki.widgets.SimpleContent(
			'<div id="editor_div">	\
			<form onsubmit="javascript: innoWiki.frontend.loadSave.saveNow(); return false;">	\
				<textarea id="wikicontent"></textarea>	\
				<div id="div_save">		\
					<input type="checkbox" id="autosave" checked="checked" /> save automatically	\
					<input type="submit" id="btn_savenow" value="save now" disabled="yes" />	\
				</div></form></div>'
		));	

		innoWiki.widgets.add("debug",
			new innoWiki.widgets.SimpleContent(
			'<textarea id="debug" rows="15" cols="80" style="width: 80%; display:none"></textarea>'
		));	