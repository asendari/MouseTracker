(function(){

	var root = this;

	var MouseTracker = root.MouseTracker = {};

	MouseTracker.VERSION = '0.0.1';

	var refresh = MouseTracker.refresh = 50;
	var debugLevel = MouseTracker.debugLevel = 0;

	var Tracker = MouseTracker.Tracker = function(options){
		refresh = MouseTracker.refresh = options.refresh || MouseTracker.refresh;
		debugLevel = MouseTracker.debugLevel = options.debugLevel || MouseTracker.debugLevel;
	}

	var genId = MouseTracker.genId = function(){
		MouseTracker.currentId= "trackerId"+Math.random();
	}

	var Start = MouseTracker.Start = function(){
		MouseTracker.genId();
		var timestamp = (new Date()).getTime();
		MouseTracker._record = {id:MouseTracker.currentId, ts:timestamp, p:[], sw:document.documentElement.clientWidth	, sh:document.documentElement.clientHeight};
		MouseTracker.TakeScreenShot(MouseTracker.currentId,timestamp);
		window.onmousemove = MouseTracker.MouseMoveTrack;
		window.onclick = MouseTracker.MouseClickTrack;
		window.ondblclick = MouseTracker.MouseDblClickTrack;
		window.onmousedown = MouseTracker.MouseDownTrack;
		window.onmouseup = MouseTracker.MouseUpTrack;
	}

	var Stop = MouseTracker.Stop = function(){
		window.onmousemove = null;
		window.onclick = null;
		window.ondblclick = null;
		window.onmousedown = null;
		window.onmouseup = null;
		MouseTracker._record.tse=(new Date()).getTime();
		MouseTrackerDB.insertRecord(JSON.stringify(MouseTracker._record));
	}


	var MouseMoveTrack = MouseTracker.MouseMoveTrack = function(e){
		if(!window.onMouseTrackerRecord){
			window.onMouseTrackerRecord = setTimeout(function(){MouseTracker.MouseMoveTrackFired(e)}, MouseTracker.refresh);
		}
	}
	var MouseMoveTrackFired = MouseTracker.MouseMoveTrackFired = function(e){
		Record.addPoint(e,"move");
		window.onMouseTrackerRecord = null;
	}

	var MouseClickTrack = MouseTracker.MouseClickTrack = function(e){
		Record.addPoint(e,"click");
	}
	var MouseDblClickTrack = MouseTracker.MouseDblClickTrack = function(e){
		Record.addPoint(e,"dblClick");
	}
	var MouseDownTrack = MouseTracker.MouseDownTrack = function(e){
		Record.addPoint(e,"down");
	}
	var MouseUpTrack = MouseTracker.MouseUpTrack = function(e){
		Record.addPoint(e,"up");
	}


	
	var Record = MouseTracker.Record = {};
	Record.addPoint = function(e, type){
		var timestamp = (new Date()).getTime()-MouseTracker._record.ts;
		MouseTracker._record.p.push({ts:timestamp,x:e.pageX, y:e.pageY, t:type});
		if(type == 'click'){
			console.log("un click à " + timestamp);
			setTimeout(function(){
				MouseTracker.TakeScreenShot(MouseTracker.currentId,timestamp);		
			},250);
			
		}
	}
	Record.save = function(){ Debug(JSON.stringify(MouseTracker._record)); }

	var TakeScreenShot = MouseTracker.TakeScreenShot = function(id, timestamp){
		window.renderer = new panda.Renderer();
		var walker = new panda.Walker();
		walker.onnode = function (node) {
			renderer.renderNode(node).then(function () {
				this.walk();
			}, this);
		};
		walker.onend = function () {	
			console.log(id, timestamp, "img size " + renderer.canvas.toDataURL().length);
			MouseTrackerDB.insertScreenShot(renderer.canvas.toDataURL(), id, timestamp);
		};
		walker.walk();
	}
	


	var Debug = MouseTracker.Debug = function (){
		if(this.console){
			if(MouseTracker.debugLevel >= 2) console.trace();
			if(MouseTracker.debugLevel >= 1) console.log(Array.prototype.slice.call(arguments) );
		}
	}

	window.addEventListener('keydown', function(e){
		// s for save
		if(e.keyCode == 83){
			console.log('Save record');
			MouseTracker.Stop();
			MouseTracker.Record.save();			
		}else
		// r for record
		if(e.keyCode == 82){
			console.log('Start Record');
			MouseTracker.Start();
		}
	});

	if(typeof MouseTrackerDB == 'undefined'){
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", '../src/utils/MouseTrackerDB.js');
		document.getElementsByTagName("head")[0].appendChild(fileref)
	}


})(this, document);
