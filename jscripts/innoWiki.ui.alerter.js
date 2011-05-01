innoWiki.events.BeforeSave.add(function(){
	innoWiki.ui.alerter.clearAlerts();	
});


innoWiki.widgets.add("alerts",
	new innoWiki.widgets.SimpleContent(
	'<table id="innowiki_ui_alerter_table"></table>'
));	



innoWiki.ui.alerter = {
	nextIndex:	0,

	addAlert: function (message){
		$("#innowiki_ui_alerter_table").append(
			"<tr id='alert_"+this.nextIndex+"' class='alert_row' style='display:none'>"
			+	"<td class='icon'><div class='alert_icon'>&nbsp;</div></td>"
			+	"<td class='message'>"+message+"</td>"
			+	"<td class='icon' onclick='innoWiki.ui.alerter.hideAlert("+this.nextIndex+")'><div class='alert_close'>&nbsp;</div></td>"
			+"</tr>"
		);
		$("#alert_"+this.nextIndex).show(200);
		this.nextIndex++;
	},

	hideAlert: function (index){
		$("#alert_"+index).hide(200);
	},
	
	clearAlerts: function(){
		$(".alert_row").hide();
	}
	
}