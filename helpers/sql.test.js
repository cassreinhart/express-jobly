const jwt = require("jsonwebtoken");
const { sqlForPartialUpdate } = require("./sql");
const { SECRET_KEY } = require("../config");


let data = {
    firstName: 'Mary',
    lastName: 'Adams',
    password: '0q2hev9beq',
    email: 'mary.adams1@gmail.com'
}

describe("map data for query", function () {
  test("works", function () {
    const { setCols, values } = sqlForPartialUpdate(data, {
        firstName: "first_name",
        lastName: "last_name",
        password: "password",
        email: "email"
      });
    expect(setCols).toEqual(`"first_name"=$1, "last_name"=$2, "password"=$3, "email"=$4`);
    expect(values).toEqual([
        'Mary',
        'Adams',
        '0q2hev9beq',
        'mary.adams1@gmail.com'
    ])
  });
});
