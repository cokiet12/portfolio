var odbc = require("odbc");
// let DSN = global._DSN; //tibero64
module.exports = {
  select : async function (query) {
    // console.log('final query')
    // console.log(query)
    const connectionStr =`DSN=${_DSN};`;
    const connection = await odbc.connect(connectionStr)
    let res;

    const result = await connection.query(query)
    .then((result)=>{
      // console.log(result);
      res = result;
    }).catch((e)=>{
      console.trace(e);
      res = {error : e.odbcErrors[0].message}
    });
    connection.close();
    return res;
  },

  update : async function (query) {
    const connectionStr =`DSN=${_DSN};`;
    const connection = await odbc.connect(connectionStr)
    let res;

    const result = await connection.query(query)
    .then((result)=>{
      console.log(result);
      res = true;
    }).catch((e)=>{
      console.trace(e);
      res = {error : e.odbcErrors[0].message}
    });
    connection.close();
    return res;
  },

  procedure : async function (catalog, schema, name, parameters, callback) {
    const connectionStr =`DSN=${_DSN};`;
    const connection = await odbc.connect(connectionStr);
    let res;

    // catalog: The name of the catalog where the procedure exists, or null to use the default catalog
    // schema: The name of the schema where the procedure exists, or null to use a default schema
    // name: The name of the procedure in the database
    // parameters?: An array of parameters to pass to the procedure. For input and input/output parameters, the JavaScript value passed in is expected to be of a type translatable to the SQL type the procedure expects. For output parameters, any JavaScript value can be passed in, and will be overwritten by the function. The number of parameters passed in must match the number of parameters expected by the procedure.
    // callback?: The function called when .callProcedure has finished execution. If no callback function is given, .callProcedure will return a native JavaScript Promise. Callback signature is:
    //  error: The error that occured in execution, or null if no error
    //  result: The result object from execution

    // ex) const result = await connection.callProcedure(null, null, 'MY_PROC', [undefined]) 
    console.log('arguments')
    console.log(arguments)
    const result = await connection.callProcedure(catalog, schema, name, parameters, callback) 
    .then((result)=>{
      console.log(result);
      res = true;
    }).catch((e)=>{
      console.trace(e);
      res = {error : e.odbcErrors[0].message}
    });
    connection.close();
    console.log(res);
    return res;
  }
}