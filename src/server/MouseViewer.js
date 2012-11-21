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
				//MouseViewer.SelectRecord(this.id);
				MouseViewer.PlayRecord(this.id);
			});
			ul.appendChild(li);
			console.log(rs.rows.item(i));
		}
		selection.appendChild(ul);
		document.body.appendChild(selection);
	}






	var PlayRecord = MouseViewer.PlayRecord = function(record_id){
		var id = record_id.split("_")[1];
		MouseTrackerDB.getRecordById(id, MouseViewer.GetScreenShotVideo);
	}
	var GetScreenShotVideo = MouseViewer.GetScreenShotVideo = function(tx, rs){
		if(rs.rows.length<=0){
			return;
		}
		records = JSON.parse(rs.rows.item(0).record);
		if(!records) return;
		if(records.p.length <= 0) return;
		MouseViewer._record = records;

		MouseTrackerDB.getScreenShotByRecord(records.id, MouseViewer.PrepareVideo);
	}

	var PrepareVideo = MouseViewer.PrepareVideo = function(tx, rs){
		if(rs.rows.length<=0){
			return;
		}

		MouseViewer._recordScreen = [];
		for(i=0; i<rs.rows.length; i++){
			console.log(rs.rows.item(i));
			MouseViewer._recordScreen.push(rs.rows.item(i));
		}

		records = MouseViewer._record;

		if(window.MouseViewerVideoContainer){
			document.body.removeChild(window.MouseViewerVideoContainer);
		}
		
		var videoContainer = window.MouseViewerVideoContainer = document.createElement("div");
		videoContainer.setAttribute("style", "position:absolute; top:25%; left:25%;");
		document.body.appendChild(videoContainer);

		var imageObj = window.MouseViewerVideoScreen =new Image();
		imageObj.setAttribute("style", "position:absolute");
		imageObj.src = MouseViewer._recordScreen[0].img;
		imageObj.width = records.sw / 2 + 1;
		imageObj.height = records.sh / 2 + 1;
		
		videoContainer.appendChild(imageObj);

		var newCanvas = document.createElement('canvas');
		newCanvas.setAttribute("style", "position:absolute");
		newCanvas.height=records.sh / 2 + 1;
		newCanvas.width=records.sw / 2 + 1;
		videoContainer.appendChild(newCanvas);



		var context = window.MouseViewerCanvasPathContext= newCanvas.getContext('2d');
		
		context.fillStyle = '#ffffff';  
		context.strokeStyle = '#000000'
		context.beginPath();
      	context.rect(1, 1, newCanvas.width-1, newCanvas.height-1);
		context.stroke();

		context.moveTo(records.p[0].x/2,records.p[0].y/2);


		

		
		
    



		window.MouseViewerVideoTime = 0;
		window.MouseViewerVideoTimeMax = records.tse - records.ts;
		console.log(window.MouseViewerVideoTimeMax);
		window.MouseViewerPlayVideo = setTimeout(function(){MouseViewer.DrawVideoFrame();}, 10);

	}

	var DrawVideoFrame = MouseViewer.DrawVideoFrame = function(){
		window.MouseViewerVideoTime += 10;

		var contextPath =  window.MouseViewerCanvasPathContext;
		
		
		for(i=1; i<records.p.length; i++){
			//path += "L"+records.p[i].x+","+records.p[i].y;
			
			if(window.MouseViewerVideoTime-10 < records.p[i].ts && window.MouseViewerVideoTime > records.p[i].ts){
				//console.log(window.MouseViewerVideoTime , records.p[i].ts)
				contextPath.lineTo(records.p[i].x/2,records.p[i].y/2);
				contextPath.stroke();

				/*if(records.p[i].t=='click'){

					contextPath.arc(records.p[i].x/2, records.p[i].y/2, 10, 0, 2 * Math.PI, false);
					contextPath.fillStyle = 'green';
					contextPath.fill();
					context.fillStyle = '#ffffff'; 
					contextPath.lineWidth = 5;
					contextPath.strokeStyle = '#003300';
					contextPath.stroke();
					
				}*/
			}
			
		}
		for(i=1; i<MouseViewer._recordScreen.length; i++){
			if(window.MouseViewerVideoTime-10 < MouseViewer._recordScreen[i].timestamp && window.MouseViewerVideoTime > MouseViewer._recordScreen[i].timestamp){
				console.log("changeImage @"+window.MouseViewerVideoTime);
				window.MouseViewerVideoScreen.src = MouseViewer._recordScreen[i].img;
			}
				
		}

		if(window.MouseViewerVideoTime <= window.MouseViewerVideoTimeMax){
			window.MouseViewerPlayVideo = setTimeout(function(){MouseViewer.DrawVideoFrame();}, 10);
		}
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
