(function(){

	var root = this;

	var MouseViewer = root.MouseViewer = {};
var NS="http://www.w3.org/2000/svg";
	MouseViewer.VERSION = '0.0.1';

	var recordViewed = [];

	MouseViewer.svg = null;

	var SelectRecord = MouseViewer.SelectRecord = function(record_id){
		

		var select = true;
		for(i=0; i<recordViewed.length; i++){
			if(recordViewed[i] == record_id){
				recordViewed.splice(i,1);
				select = false;
			}
		}
		if(select)
			recordViewed.push(record_id);
		
		MouseViewer.RedrawRecords();
	}

	var RedrawRecords = MouseViewer.RedrawRecords = function(){

		if(MouseViewer.svg)
			document.body.removeChild(MouseViewer.svg);

		
		MouseViewer.svg = document.createElementNS(NS,"svg");
		MouseViewer.svg.className="recordPlay";
		MouseViewer.svg.setAttribute("width","100%");
		MouseViewer.svg.setAttribute("height","100%");
		MouseViewer.svg.setAttribute("version","1.1");
		MouseViewer.svg.setAttribute("xmlns","http://www.w3.org/2000/svg");
		MouseViewer.svg.setAttribute("style","overflow: hidden; position: absolute; left: 0px; top: 0px; ");
		document.body.appendChild(MouseViewer.svg );

		for(i=0; i<recordViewed.length; i++){
			var id = recordViewed[i].split("_")[1];
			MouseTrackerDB.getRecordById(id, MouseViewer.DrawRecords);
		}
	}


	var DrawRecords = MouseViewer.DrawRecords = function(tx, rs){
		if(rs.rows.length<=0){
			return;
		}
		console.log(rs.rows);
		records = JSON.parse(rs.rows.item(0).record);
		if(!records) return;
		if(records.p.length <= 0) return;
		MouseViewer._record = records;

		


		var path = "M"+records.p[0].x+","+records.p[0].y;
		for(i=1; i<records.p.length; i++){
			path += "L"+records.p[i].x+","+records.p[i].y;
			if(records.p[i].t=='click'){
				var circle = document.createElementNS(NS, "circle");
				circle.setAttributeNS(null, "cx", records.p[i].x);
				circle.setAttributeNS(null, "cy", records.p[i].y);
				circle.setAttributeNS(null, "r",  10);
				circle.setAttributeNS(null, "fill", "green");
				MouseViewer.svg.appendChild(circle);
			}
		}


		var pathEl=document.createElementNS(NS,"path");
		pathEl.setAttribute("fill","none");
		pathEl.setAttribute("stroke","#000000");
		pathEl.setAttribute("d",path);

		MouseViewer.svg.appendChild(pathEl);

		

	}

	var ShowRecords = MouseViewer.ShowRecords = function(){
		MouseTrackerDB.getAllRecords(MouseViewer.ShowRecordsPrint);
	}
	var ShowRecordsPrint = MouseViewer.ShowRecordsPrint = function(tx, rs){
		var selection = document.createElement("div");
		selection.className="selectRecord";
		selection.setAttribute("style", "position:absolute; width:300px; background-color:grey; height:500px; border:1px solid red;");

		var ul = document.createElement("ul");
		for (var i=0; i < rs.rows.length; i++) {
			var li = document.createElement("li");
			li.id="records_"+rs.rows.item(i).ID;
			var text = document.createTextNode(rs.rows.item(i).ID+" | "+rs.rows.item(i).added_on);
			li.appendChild(text);
			li.addEventListener("click",function(){
				var selection = document.body.getElementsByClassName('selectRecord')[0];
				document.body.removeChild(selection);
				console.log(this.id);
				MouseViewer.SelectRecord(this.id);
			});
			ul.appendChild(li);
			console.log(rs.rows.item(i));
		}
		selection.appendChild(ul);
		document.body.appendChild(selection);
	}

	window.addEventListener('keydown', function(e){
		if(e.keyCode == 80){
			console.log('Print Record');
			//MouseViewer.Viewer(MouseTracker._record);
			MouseViewer.ShowRecords();
		}
	});

	if(typeof MouseTrackerDB == 'undefined'){
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", '../src/utils/MouseTrackerDB.js');
		document.getElementsByTagName("head")[0].appendChild(fileref)
	}

})(this, document);
