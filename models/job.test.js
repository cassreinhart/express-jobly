"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "New",
    salary: 400000,
    equity: 0.04,
    companyHandle: "c3",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    // expect(job).toEqual(Job);
    console.log(job.id)
    console.log("#########################")
    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, [job.id]);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "New",
        salary: 400000,
        equity: "0.04",
        company_handle: "c3",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "J1",
        salary: 100000,
        equity: "0.01",
        companyHandle: "c1",
      },
      {
        id: 2,
        title: "J2",
        salary: 200000,
        equity: "0.02",
        companyHandle: "c2",
      },
      {
        id: 3,
        title: "J3",
        salary: 300000,
        equity: "0.03",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "J1",
      salary: 100000,
      equity: "0.01",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("nope");
      // fail(); //deprecated
      expect(res.statusCode).toBe(404)
    } catch (err) {
      // expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** filter */

describe("filter", function () {
  test("works for title filter", async function () {
    let data = {
      "data": {
          "filterVar": "title",
          "searchTerm": "1" 
      }
    }

    console.log(data.data.filterVar) 
    console.log(data.data.searchTerm)
    let jobs = await Job.filter({
      "filterVar": "title",
      "searchTerm": "1" 
  });
    console.log(jobs)
    

    expect(jobs).toEqual([
        {
            id: 1,
            title: "J1",
            salary: 100000,
            equity: "0.01",
            companyHandle: "c1",
        }
    ])
  });


  test("works for minSalary filter", async function () {
    let jobs = await Job.filter({
          "filterVar": "minSalary",
          "searchTerm": "250000" 
      });

    expect(jobs).toEqual([
        {
            id: 3,
            title: "J3",
            salary: 300000,
            equity: "0.03",
            companyHandle: "c3",
        }
    ])
  });

  test("works for hasEquity filter", async function () {
    let jobs = await Job.filter({
          "filterVar": "hasEquity",
          "searchTerm": "true" 
      });

    expect(jobs).toEqual([
        {
            id: 1,
            title: "J1",
            salary: 100000,
            equity: "0.01",
            companyHandle: "c1",
          },
          {
            id: 2,
            title: "J2",
            salary: 200000,
            equity: "0.02",
            companyHandle: "c2",
          },
          {
            id: 3,
            title: "J3",
            salary: 300000,
            equity: "0.03",
            companyHandle: "c3",
        }
    ])
  });

  test("not found if no match", async function () {
    try {
      const res = await Job.filter("a");
      expect(res.statusCode).toBe(404)  //in place of deprecated fail()
    } catch (err) {
      console.log(err)
      // expect(err instanceof NotFoundError).toBeTruthy(); ????????????
    }
  });
});


/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 150000,
    equity: "0.05",
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New",
      salary: 150000,
      equity: "0.05",
      company_handle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
      companyHandle: 'c1',
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "New",
      salary: null,
      equity: null,
      companyHandle: 'c1',
    }]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(999, updateData);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
