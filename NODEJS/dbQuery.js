var asyncjs = require('async');
var tibero = require('./dbConn').pool;

module.exports = {
  select : function (query){
    console.log('final query : ' + query)
    return new Promise ((resolve) => {
      console.log(tibero);
      tibero.reserve(function(err, connObj) {
        if (connObj) {
          console.log("Using connection: " + connObj.uuid);
          var conn = connObj.conn;

          asyncjs.series([
            function(callback) {
              conn.createStatement(function(err, statement) {
                if (err) {
                  callback(err);
                } else {
                  // Adjust some statement options before use.  See statement.js for
                  // a full listing of supported options.
                  statement.setFetchSize(100, function(err) {
                    if (err) {
                      callback(err);
                    } else {
                      statement.executeQuery(query,
                                              function(err, resultset) {
                        if (err) {
                          console.log('-------DB ERROR!!!!!!!!!!!!!!!!!------')
                          console.log(err)
                          callback(err)
                        } else {
                          resultset.toObjArray(function(err, results) {
                            if (results.length > 0) {
                              var result = JSON.stringify(results)
                              // console.log('results O : ' + result + ', ' + typeof(results));
                              callback(null, result);
                            } else {
                              result = JSON.stringify({desc : '데이터 길이가 0입니다'});
                              // console.log('results X : ' + result + ', ' + typeof(results) + err);
                              callback(null, result);
                            }
                            
                          });
                        }
                      });
                    }
                  });
                }
              });
            },
          ], function(err, results) {
            // console.log('results and type : ' + results + ', ' + typeof(results));
            tibero.release(connObj, function(err) {
              if (err) {
                console.log('model err : ' + err.message);
              } else {
                console.log(connObj.uuid + ' released!!!');
              }
             resolve(JSON.parse(results));
            });
          });
        }
      })
    });
  },
  update : function (query){
    console.log('final query : ' + query)
    return new Promise ((resolve) => {
      tibero.reserve(function(err, connObj) {
        if (connObj) {
          console.log("Using connection: " + connObj.uuid);
          var conn = connObj.conn;

          asyncjs.series([
            function(callback) {
              conn.createStatement(function(err, statement) {
                if (err) {
                  callback(err);
                } else {
                  // console.log('statement : ' + JSON.stringify(statement));
                  statement.executeUpdate(query,
                  function(err, count) {
                    if (err) {
                      console.log('-------DB ERROR!!!!!!!!!!!!!!!!!------')
                      console.log(err)
                      callback(err);
                    } else {
                      callback(null, count);
                    }
                  });
                }
              });
            },
          ], function(err, results) {
            // Results can also be processed here.
            // Release the connection back to the pool.
            console.log('results and type : ' + JSON.stringify(results) + ', ' + typeof(results));
            tibero.release(connObj, function(err) {
              if (err) {
                console.log(err.message);
              } else {
                console.log(connObj.uuid + ' released!!!');
              }
            resolve(results);
            });
          });
        }
      })
    });
  }
}