
var ping = require ("net-ping");
var pg = require('pg');
var session = ping.createSession ();
var target = '127.0.0.1';

session.pingHost (target, function (error, target, sent, rcvd) {
    var ms = rcvd - sent;
    if (error)
        console.log (target + ": " + error.toString ());
    else
        console.log (target + ": Alive");
	insert(target, ms); 
});

const graph = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'grafana',
  password: 'postgres',
  port: 5432,
});

function insert(ip,val){
        console.log('inserts:', val);
        //for( var i = 0; i < vals.length; i++){
                graph.connect(function(err, client, done) {
                    var coll;
                    if(err) {
                        done();
                        console.log(err);
                        return res.status(500).json({success: false, data: err});
                    }
		    var sql = 'INSERT INTO icmp  (timestamp,latency,ip) values (now(),' + val + ',\'' + ip + '\') returning id;';
		    console.log(sql);
                    client.query(sql, function (err,result) {
                        if(err){
                                console.log("err", err.stack);
                        }else{
                                done();
				console.log(result.rows[0]);
                                //poll(result.rows[0]);
                         }
                    });

                });
        //}
}
