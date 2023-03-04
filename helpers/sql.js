const { BadRequestError } = require("../expressError");

// Accepts an object of data w/ key value pairs {{columnName: dataToEnter}, ...}
// And an object matching JS var names to SQL col names {{jsVarName: sqlColumnName}, ...}
// maps data to enter into SQL query, complete w/SQL variables ($1, $2, etc.)
//returns an object: {
//  setCols:  ['"first_name"=$1', '"age"=$2'],
//  values: [
//   'Aliya',
//   32
// ]
//}

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "), 
    values: Object.values(dataToUpdate), //sets values to be the values for SQL to enter (in order)
  };
}

module.exports = { sqlForPartialUpdate };
