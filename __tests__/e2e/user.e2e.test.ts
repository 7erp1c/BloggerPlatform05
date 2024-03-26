import request = require("supertest");
import {app} from "../../src/app";
const routerName = "/user/";

const Results =  {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
}

describe(routerName, () => {
    // clear DB before testing
    beforeAll(async () => {
        await request(app).delete("/testing/all-data");
    })
    it(" - should be return 200 and empty array", async () => {
        await request(app).get(routerName).expect(200,Results);
    })

})