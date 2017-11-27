
console.log('starting pinger');
var ping = require ("net-ping");
var pg = require('pg');

const pool = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'fiims',
  password: 'postgres',
  port: 5432,
});

const graph = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'grafana',
  password: 'postgres',
  port: 5432,
});

function getDevices(){
        pool.connect(function(err, client, done) {
            var coll;
            if(err) {
              done();
              console.log(err);
              return res.status(500).json({success: false, data: err});
            }
            client.query('SELECT array_agg(ip_address::TEXT) FROM inus;', function (err,result) {
                if(err){
                        console.log("err", err.stack);
                }else{
                        done();
                        //console.log('query resturned: ', result.rows[0]);
                        pingem(result.rows[0]);
                }
            });

        });
}

function pingem(targets){
	var session = ping.createSession ();
	var results = [];
	var result_targets = [];
	//console.log('targets: ',targets.array_agg);
	//console.log(targets.array_agg.length);
	for (var i = 0; i < targets.array_agg.length; i++){
		var target = targets.array_agg[i];
		//console.log('target:',target);
		session.pingHost (target, function (error, target, sent, rcvd) {
		    if (error){
		        console.log (target + ": " + error.toString ());
			var ms = 0;
                        results.push(ms);
			result_targets.push(target);
		    }else{
		        //console.log (target + ": Alive");
		    	var ms = rcvd - sent;
                        results.push(ms);
			result_targets.push(target);
		    }
		    //console.log('len of [results] [total targets]', results.length, targets.array_agg.length);	
		    if(results.length >= targets.array_agg.length){
		    	insert(result_targets, results);
		    }
		});
	}
}


function insert(ips,vals){
        //console.log('inserts:',ips, vals);
        var sql  = '';
        for( var i = 0; i < vals.length; i++){
                sql += 'INSERT INTO ds_icmp (timestamp, sensor, latency) values (now(),\'' + ips[i] + '\',\'' + vals[i] + '\');';
        }
	//for( var i = 0; i < vals.length; i++){
                pool.connect(function(err, client, done) {
                    var coll;
                    if(err) {
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data: err});
                    }
		    console.log(sql);
                    client.query(sql, function (err,result) {
                        if(err){
                                console.log("err", err.stack);
                        }else{
                                done();
				console.log('done');
                        }
                    });

                });
        //}
}

var intvl = setInterval(function(){
        console.log(new Date());
        getDevices();
}, 10000);


