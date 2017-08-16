module.exports = (express, connection) => {
	var router      = express.Router();

	// Router Middleware
	router.use((req, res, next) => {
	    // log each request to the console
	    console.log("You have hit the /api", req.method, req.url);

	    // CORS 
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	    next();
	});

	router.get('/', (req, res) => {
	    res.jsonp({
	        name: 'Cobbler-App-Backend API', 
	        version: '0.0.1',
	    });
	});

	// COLLECTION APPS ROUTES
	router.route('/apps')
	    .post((req, res) => {
	        var data = req.body;
	        console.log(req.body)
	        var query = connection.query('INSERT INTO Apps SET ?', [data], (err, result) => {
	            if(err) {
	                console.error(err);
	                res.sendStatus(404);
	            } else {
					var getAppQuery = connection.query('SELECT * FROM Apps WHERE id = ?', result.insertId, (err, result) => {
						if(err) {
							console.error(err);
							res.sendStatus(404);
						} else {
							res.status(201);
							res.send(result);
						}
					});
	            }
	        });
	        console.log(query.sql);
	    })

	    .get((req, res) => {
	        var query = connection.query('SELECT * FROM Apps', (err, rows, fields) => {
	            if (err) console.error(err);

	            res.jsonp(rows);
	        });
	        console.log(query.sql);
	    })
	//end route

	// ITEM APPS ROUTES
	router.route('/apps/:id')
	    .post((req, res) => {
	        //specific item should not be posted to (either 404 not found or 409 conflict?)
	        res.sendStatus(404);
	    })

	    .get((req, res) => {
	        var query = connection.query('SELECT * FROM Apps WHERE id=?', req.params.id, (err, rows, fields) => {
	            if (err) {
	                //INVALID
	                console.error(err);
	                res.sendStatus(404);
	            } else {
	                if(rows.length) {
	                    res.jsonp(rows);
	                } else {
	                    //ID NOT FOUND
	                    res.sendStatus(404);
	                }
	            }
	        });
	        console.log(query.sql);
	    })

	    .put((req, res) => {
	        var data = req.body;
	        var query = connection.query('UPDATE Apps SET ? WHERE id=?', [data, req.params.id], (err, result) => {
	            if(err){
	                console.log(err);
					res.sendStatus(404);
	            }else{
	                res.status(200).jsonp({changedRows:result.changedRows, affectedRows:result.affectedRows}).end();
	            }
	        })
			console.log(query.sql);
	    })

	    .delete((req, res) => {
	        var query = connection.query('DELETE FROM Apps WHERE id=? LIMIT 1', [req.params.id], (err, result) => {
	            if(err){
	                console.log(err);
	                res.sendStatus(404);
	            }else{
	                res.status(200).jsonp({affectedRows:result.affectedRows}).end();
	            }
	        });
	        console.log(query.sql)
	    });
	//end route

	router.route('/users/:id')
	    .get((req, res) => {
	        var query = connection.query('SELECT * FROM Users WHERE id = ?', req.params.id, (err, rows, fields) => {
	            if (err) {
	                //INVALID
	                console.error(err);
	                res.sendStatus(404);
	            } else {
	                if(rows.length) {
	                    res.jsonp(rows[0]);
	                } else {
	                    //ID NOT FOUND
	                    res.sendStatus(404);
	                }
	            }
	        });
	        console.log(query.sql);
	    })
	//end route

	// FUNCTIONS USERS ROUTES
	router.route('/users/:id/getApps')
	    .get((req, res) => {
	        var query = connection.query('SELECT * FROM Apps WHERE ownerFk=?', req.params.id, (err, rows, fields) => {
	            if (err) {
	                //INVALID
	                console.error(err);
	                res.sendStatus(404);
	            } else {
	                if(rows.length) {
	                    res.jsonp(rows);
	                } else {
	                    //ID NOT FOUND
	                    res.sendStatus(404);
	                }
	            }
	        });
	        console.log(query.sql);
	    })
	//end route

	router.route('/users/:id/getUserApps')
	    .get((req, res) => {
	        var query = connection.query('SELECT null as app, addedBy, addedOn, lastVisited, userStatus, role FROM UserAppsData WHERE UserAppsData.userFk = ?', req.params.id, (err, rows, fields) => {
	            if (err) {
	                //INVALID
	                console.error(err);
	                res.sendStatus(404);
	            } else {
	                if(rows.length) {
	                    res.jsonp(rows);
	                } else {
	                    //ID NOT FOUND
	                    res.sendStatus(404);
	                }
	            }
	        });
	        console.log(query.sql);
	    })
	//end route

	return router;
};