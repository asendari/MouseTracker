(function(){

	var root = this;

	if(root.MouseTrackerDB){
		return;
	}

	var MouseTrackerDB = root.MouseTrackerDB = {};

	MouseTrackerDB.VERSION = '1';

	MouseTrackerDB.db = null;
	MouseTrackerDB.open = function(){
		var dbSize = 5 * 1024 * 1024; // 5MB
		MouseTrackerDB.db = openDatabase("MouseTracker", "", "MouseTracker", dbSize);
	}
	MouseTrackerDB.onError = function(tx, e) {
		console.log("There has been an error: " + e.message);
	}

	MouseTrackerDB.onSuccess = function(tx, r) {
		//html5rocks.webdb.getAllTodoItems(loadTodoItems);
	}

	MouseTrackerDB.createTable = function() {
		var db = MouseTrackerDB.db;
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS " +
	                  "records(ID INTEGER PRIMARY KEY ASC, record TEXT, added_on DATETIME)", []);
		});
		db.transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS " +
	                  "screenshot(ID INTEGER PRIMARY KEY ASC, img TEXT, record_id TEXT, timestamp TEXT)", []);
		});
	}
	MouseTrackerDB.dropTable = function(){
		var db = MouseTrackerDB.db;
		db.transaction(function(tx) {
			tx.executeSql("DROP TABLE IF EXISTS records");
		});
		db.transaction(function(tx) {
			tx.executeSql("DROP TABLE IF EXISTS screenshot");
		});
	}



	MouseTrackerDB.insertRecord = function(record) {
		var db =MouseTrackerDB.db;
		db.transaction(function(tx){
			var addedOn = new Date();
			tx.executeSql("INSERT INTO records(record, added_on) VALUES (?,?)",
				[record, addedOn],
				MouseTrackerDB.onSuccess,
				MouseTrackerDB.onError);
		});
	}

	MouseTrackerDB.getAllRecords = function(renderFunc) {
		var db =MouseTrackerDB.db;
		db.transaction(function(tx){
			tx.executeSql("SELECT * FROM records", [], renderFunc, MouseTrackerDB.onError);
		});
	}
	MouseTrackerDB.getRecordById = function(id, renderFunc) {
		var db =MouseTrackerDB.db;
		db.transaction(function(tx){
			tx.executeSql("SELECT * FROM records where ID=?", [id], renderFunc, MouseTrackerDB.onError);
		});
	}


	MouseTrackerDB.insertScreenShot = function(ss, rid, ts) {
		var db =MouseTrackerDB.db;
		db.transaction(function(tx){
			var addedOn = new Date();
			tx.executeSql("INSERT INTO screenshot(img,record_id, timestamp) VALUES (?,?,?)",
				[ss, rid, ts],
				MouseTrackerDB.onSuccess,
				MouseTrackerDB.onError);
		});
	}

	MouseTrackerDB.open();
	MouseTrackerDB.createTable();


	window.addEventListener('keydown', function(e){
		// s for save
		if(e.keyCode == 68){
			if(confirm("Drop table ?")){
				MouseTrackerDB.dropTable();
				MouseTrackerDB.createTable();
			}
			
		}
	});


})(this, document);
