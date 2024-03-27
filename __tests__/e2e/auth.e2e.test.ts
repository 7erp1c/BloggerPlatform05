import request = require("supertest");
import {app} from "../../src/app";
import {client, usersCollection} from "../../src/db/mongo-db";

const routerName = '/auth/login'
const emptyData = {
    loginOrEmail: "",
    password: "",

}
const spaceData = {
    loginOrEmail: "    ",
    password: "    ",

}
const overLengthData = {
    loginOrEmail: "hua_you",
    password: "qwerty123",

}
const validCreateData = {
    loginOrEmail: "new title",
    shortDescription: "a very short description",
    content: "some content",
    blogId: "testBlogID"
}
const validUpdateData = {
    login: "update title",
    shortDescription: "a very short new description",
    content: "some new content",
}
const Results = {
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    totalCount: 0,
    items: []
}
describe(routerName, () => {
    beforeAll(async () => {
        await client.connect();
        await request(app).delete("/testing/all-data")
    })
    afterAll(async () => {
        await client.close();
    })

//POST
    it("POST creating a user with the help of an admin", async () => {
        const res = request(app).post(routerName)
            .send({
                loginOrEmail: "ul_tray@bk.ru",
                password: "string"
            })
            .expect(204)
    })
    it("POST incorrect date", async () => {
        const res = request(app).post(routerName)
            .send({
                loginOrEmail: "",
                password: ""
            })
            .expect(400, {
                errorsMessages: [
                    {message: "Bad request", field: "loginOrEmail"},
                    {message: "Bad request", field: "password"},
                ]
            })
    })


})