function SharePointConnection(){
	this.siteUrl = location.href.replace(/^(.*)\/innoWiki\/editor\.htm.*$/,"$1");
	this.activeList = "innowiki";
	this.historyList = "innowiki-history";

	this.getPageFromHistory = function (title){
		return this.getItems(
			this.historyList,
			"<Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>"
			+ title
			+ "</Value></Eq></Where><OrderBy><FieldRef Name='ID' Ascending='FALSE'/></OrderBy></Query>",
			"<FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Summary' /><FieldRef Name='Content' /><FieldRef Name='Editor' /><FieldRef Name='Modified' />",
			1)[0];
	}
	
	this.getLastHistoryId = function(){
		return this.getItems(
			this.historyList,
			"<Query><OrderBy><FieldRef Name='ID' Ascending='FALSE'/></OrderBy></Query>",
			"<FieldRef Name='ID' />",
			1)[0].id;
	}

	this.getActivePage = function(title){
		return this.getItems(
			this.activeList,
			"<Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>"
			+ title
			+ "</Value></Eq></Where><OrderBy><FieldRef Name='ID' Ascending='FALSE'/></OrderBy></Query>",
			"<FieldRef Name='ID' />",
			1)[0];
	}
	
	this.getActivePageList = function (){
		return this.getItems(
			this.activeList,
			"<Query><OrderBy><FieldRef Name='ID' Ascending='TRUE'/></OrderBy></Query>",
			"<FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Summary' /><FieldRef Name='Editor' /><FieldRef Name='Modified' />",
			1000000
		);
	}

	this.getPagesFromHistoryNewerThan = function (id){
		return this.getItems(
			this.historyList,
			"<Query><Where><Gt><FieldRef Name='ID'/><Value Type='Counter'>"
			+ id + "</Value></Gt></Where><OrderBy><FieldRef Name='ID' Ascending='TRUE'/></OrderBy></Query>",
			"<FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='Summary' /><FieldRef Name='Editor' /><FieldRef Name='Modified' />",
			1000000
		);
	}

	
	this.getCurrentUserLogin = function (){
			var resp = callWebService({
				url: this.siteUrl + "/_vti_bin/userprofileservice.asmx",
				soapaction: "http://microsoft.com/webservices/SharePointPortalServer/UserProfileService/GetUserProfileByName",
				body: "<GetUserProfileByName xmlns='http://microsoft.com/webservices/SharePointPortalServer/UserProfileService'>"
					+ "<AccountName></AccountName>"
					+ "</GetUserProfileByName>"
			});

			if(resp.getElementsByTagNameNS){
				// standard compliant...
				var rows = resp.getElementsByTagNameNS("http://microsoft.com/webservices/SharePointPortalServer/UserProfileService","PropertyData")
			} else {
				// msxml screws namesspaces...
				var rows = resp.getElementsByTagName("PropertyData")
			}

			var userProfile = new Object();
			var row, pname, value;

			//TODO: replace with xpath
			for(var i=0; i<rows.length; i++){
				row = rows.item(i);

				pname = ""; value ="";
				
				try{
				if(resp.getElementsByTagNameNS){
					// standard compliant...
					pname = row.getElementsByTagNameNS("http://microsoft.com/webservices/SharePointPortalServer/UserProfileService","Name")[0].firstChild.nodeValue;
					value = row.getElementsByTagNameNS("http://microsoft.com/webservices/SharePointPortalServer/UserProfileService","Value")[0].firstChild.nodeValue;
				} else {
					// msxml screws namesspaces...
					pname = row.getElementsByTagName("Name")[0].firstChild.nodeValue;
					value = row.getElementsByTagName("Value")[0].firstChild.nodeValue;
				}
				//debugpp(pname + "=" + value);
				} catch(err){}
				
				userProfile[pname] = value;
				
			}
			
			return userProfile.AccountName;
		}
	
	this.getUserlist = function (){
			var resp = callWebService({
				url: this.siteUrl + "/_vti_bin/UserGroup.asmx",
				soapaction: "http://schemas.microsoft.com/sharepoint/soap/directory/GetUserCollectionFromSite",
				body: "<GetUserCollectionFromSite />"
			});

			if(resp.getElementsByTagNameNS){
				// standard compliant...
				rows = resp.getElementsByTagNameNS("http://schemas.microsoft.com/sharepoint/soap/directory/","User")
			} else {
				// msxml screws namesspaces...
				rows = resp.getElementsByTagName("User")
			}
			
			var ret = new Object();
			var row, user;
			
			for(var i=0; i<rows.length; i++){
				row = rows.item(i);
				
				user = new innoWiki.classes.UserItem(
					row.getAttribute("ID"),
					row.getAttribute("Name"),
					row.getAttribute("LoginName"),
					row.getAttribute("Email")
					);
				
				ret[user.id] = user;
			}
			
			return ret;
		}
	
	
	// private
	this.getItems =	function (listName, queryString, viewFields, rowLimit){
			var resp = callWebService({
				url: this.siteUrl + "/_vti_bin/lists.asmx",
				soapaction: "http://schemas.microsoft.com/sharepoint/soap/GetListItems",
				body: "<GetListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'>"
						+ "<listName>" + listName + "</listName>"
						+ "<query>" + queryString + "</query>"
						+ (viewFields!="" ? "<viewFields><ViewFields>" + viewFields + "</ViewFields></viewFields>" : "")
						+ "<rowLimit>" + rowLimit + "</rowLimit>"
						+ "<QueryOptions><IncludeMandatoryColumns>FALSE</IncludeMandatoryColumns></QueryOptions>"
						+ "<webID/>"
						+ "</GetListItems>"
			});
			
			if(resp.getElementsByTagNameNS){
				// standard compliant...
				rows = resp.getElementsByTagNameNS("#RowsetSchema","row")
			} else {
				// msxml screws namesspaces...
				rows = resp.getElementsByTagName("z:row")
			}
			
			var row, page, content;
			var ret = new Array();

			for(var i=0; i<rows.length; i++){
				row = rows.item(i);
				
				page = new innoWiki.classes.PageListItem();
				page.id = row.getAttribute("ows_ID");
				page.title = row.getAttribute("ows_Title");
				page.summary = row.getAttribute("ows_Summary") || "";
				page.editor = innoWiki.backend.users.listById[(row.getAttribute("ows_Editor") || "").split(";")[0]];
				page.date = row.getAttribute("ows_Modified") || "";

				content = row.getAttribute("ows_Content") || "";
			//http://social.technet.microsoft.com/Forums/en-US/sharepointdevelopment/thread/9649edea-fb87-456b-a43d-40e730a698f8/
				if(content.substr(0,24)=='<div class=ExternalClass'){
					content = content.substring(content.indexOf(">")+1,content.lastIndexOf("<"));
				}
				
				page.setContent(content);
				
				ret.push(page);
				
			}
			
			return ret;
				
		}

	this.save = function (page){
		// upload into history
			var updateString = 
			"<Batch OnError='Continue' ListVersion='1' ViewName=''><Method ID='1' Cmd='New'>"
			+ "<Field Name='Title'><![CDATA[" + page.title + "]]></Field>"
			+ "<Field Name='Summary'><![CDATA[" + page.summary + "]]></Field>"
			+ "<Field Name='Content'><![CDATA[" + page.content + "]]></Field>"
			+ "</Method></Batch>";
	
			var resp = callWebService({
				url: this.siteUrl + "/_vti_bin/lists.asmx",
				soapaction: "http://schemas.microsoft.com/sharepoint/soap/UpdateListItems",
				body: "<UpdateListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'>"
						+ "<listName>" + this.historyList + "</listName>"
						+ "<updates>" + updateString + "</updates>"
						+ "</UpdateListItems>"
			});	

			this.handleErrors(resp);
			
		//save historyId
			if(resp.getElementsByTagNameNS){
				// standard compliant...
				rows = resp.getElementsByTagNameNS("#RowsetSchema","row")
			} else {
				// msxml screws namesspaces...
				rows = resp.getElementsByTagName("z:row")
			}
			
			page.historyId = rows.item(0).getAttribute("ows_ID");

			
		//update active pages
			if( ! page.id ) {
				//we created this page, but maybe someone else too
				var concurrentpage = this.getActivePage(page.title);
				if(concurrentpage) page.id = concurrentpage.id;
			}

			if( page.id ){
			//update page
				updateString = 
				"<Batch OnError='Continue' ListVersion='1' ViewName=''><Method ID='1' Cmd='Update'>"
				+ "<Field Name='ID'>" + page.id + "</Field>"
				+ "<Field Name='Summary'><![CDATA[" + page.summary + "]]></Field>"
				+ "<Field Name='Content'><![CDATA[" + page.content + "]]></Field>"
				+ "</Method></Batch>";
			} else {
			//new page
				updateString = 
				"<Batch OnError='Continue' ListVersion='1' ViewName=''><Method ID='1' Cmd='New'>"
				+ "<Field Name='ID'>new</Field>"
				+ "<Field Name='Title'><![CDATA[" + page.title + "]]></Field>"
				+ "<Field Name='Summary'><![CDATA[" + page.summary + "]]></Field>"
				+ "<Field Name='Content'><![CDATA[" + page.content + "]]></Field>"
				+ "</Method></Batch>";
			}
	
			resp = callWebService({
				url: this.siteUrl + "/_vti_bin/lists.asmx",
				soapaction: "http://schemas.microsoft.com/sharepoint/soap/UpdateListItems",
				body: "<UpdateListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'>"
						+ "<listName>" + this.activeList + "</listName>"
						+ "<updates>" + updateString + "</updates>"
						+ "</UpdateListItems>"
			});	

			this.handleErrors(resp);

		}
		
	this.handleErrors = function(response){
			//TODO: better error handling
			var res = response.getElementsByTagName("ErrorCode").item(0).firstChild.nodeValue;
			if(res!="0x00000000") {
				alert(response.getElementsByTagName("ErrorText").item(0).firstChild.nodeValue);
				//throw( {number: res,description: resp.getElementsByTagName("ErrorText").item(0).firstChild.nodeValue});
			}
		}
}