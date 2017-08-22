module.exports = (express, connection) => {
	var router      = express.Router();
	var newAppId = -1;

	connection.query('USE ebdb', (err, result) => {
		if (err) {
			console.log('Error changing the db. ', err);
		} else {
			console.log('db changed to ebdb. ');
		}
	});
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
		// var sqlDrop = 
		// 	DROP TABLE IF EXISTS Users;
		// 
		// var query = connection.query(sqlDrop, (err, result) => {
		// 	if(err) {
		// 		res.jsonp(err);
		// 	} else {
		// 		var sqlCreate = 
		// 			CREATE TABLE IF NOT EXISTS Users (
		// 				id INT(11) NOT NULL AUTO_INCREMENT,
		// 				firstName VARCHAR(45) NOT NULL,
		// 				lastName VARCHAR(45) NOT NULL,
		// 				email VARCHAR(45) NOT NULL,
		// 				password VARCHAR(255) NOT NULL,
		// 				confirmed TINYINT(4) NOT NULL,
		// 				accountsFk INT(11) NULL DEFAULT NULL,
		// 				PRIMARY KEY (id),
		// 				UNIQUE INDEX id_UNIQUE (id ASC),
		// 				UNIQUE INDEX Email_UNIQUE (email ASC),
		// 				UNIQUE INDEX Password_UNIQUE (password ASC),
		// 				UNIQUE INDEX Accounts_FK_UNIQUE (accountsFk ASC)
		// 			)
		// 		
		// 		var query = connection.query(sqlCreate, (err, result) => {
		// 			if(err) {
		// 				res.jsonp(err);
		// 			} else {
		// 				res.jsonp(result);
		// 			}
		// 		});

		// 	}
		// });
	});

	// COLLECTION APPS ROUTES
	router.route('/apps')
	    .post((req, response) => {
	        var data = req.body;
	        console.log(req.body);
	        var query = connection.query('INSERT INTO Apps SET ?', [data], (err, result) => {
	            if(err) {
	                console.error(err);
	                response.sendStatus(404);
	            } else {
					newAppId = result.insertId;
					console.log('New app id = ', newAppId);
					var queryAddAppUsers = connection.query(
					`
						INSERT INTO App_Users
						(appFk,
						userFk,
						addedBy,
						addedOn,
						lastVisited,
						userStatusFk,
						roleFk)
						VALUES
						(` + result.insertId + `, ` + data.ownerFk + `, ` + data.ownerFk + `, now(), null, 3, 3)
					`
					, [data], (err, res) => {
						if(err) {
							console.error(err);
							response.sendStatus(404);
						} else {
							var getAppQuery = connection.query('SELECT * FROM Apps WHERE id = ?', newAppId, (err, rows, fields) => {
								if(err) {
									console.error(err);
									response.sendStatus(404);
								} else {
									console.log('New app inserted result: ', rows);
									response.jsonp(rows);
								}
							});
						}
	            	})
				}
			})
	    })

	    .get((req, res) => {
	        var query = connection.query('SELECT * FROM All_Apps', (err, rows, fields) => {
	            if (err) {
					console.error(err)
					res.jsonp(err);
				};

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
	        var query = connection.query('UPDATE Apps SET ? WHERE id=?', [data, req.params.id], (err, res) => {
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

	router.route('/apps/:id/saveTab/:tabId')
	    .put((req, res) => {
			var data = req.body;
			var tabId = req.params.tabId;
			var appId = req.params.id;
			var sql;
			if (tabId > 0) {
				sql = 'UPDATE app_forms SET ? WHERE id=?';
			} else {
				sql = 
				`
					INSERT INTO app_forms
					(name,
					description,
					updatedOn,
					appFk,
					formTypeFk,
					ownerFk,
					createdOn,
					formSchema)
					VALUES
					(` + data.name + `, 
					 ` + data.description + `,
					   now(), 
					 ` + appId + `,
					 ` + data.formTypeFk + `,
					   2,
					   now(),
					 ` + data.formSchema + `
					)
				`

			}
	        var query = connection.query(sql, [data, tabId], (err, res) => {
	            if(err){
	                console.log(err);
					res.sendStatus(404);
	            }else{
	                res.status(200).jsonp({changedRows:res.changedRows, affectedRows:res.affectedRows}).end();
	            }
	        })
			console.log(query.sql);
	    });
	//end route

	router.route('/apps/:id/getAppForms')
	    .get((req, res) => {
	        var query = connection.query('SELECT * FROM app_forms_by_id WHERE id = ?', req.params.id, (err, rows, fields) => {
	            if (err) {
	                //INVALID
	                console.error(err);
	                res.sendStatus(404);
	            } else {
	                if(rows.length) {
	                    res.jsonp(rows);
	                } else {
	                    //ID NOT FOUND
	                    res.jsonp(null);
	                }
	            }
	        });
	        console.log(query.sql);
	    })
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
	        var query = connection.query('SELECT null as app, appFk, addedBy, addedOn, lastVisited, userStatus, role FROM UserAppsData WHERE UserAppsData.userFk = ?', req.params.id, (err, rows, fields) => {
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