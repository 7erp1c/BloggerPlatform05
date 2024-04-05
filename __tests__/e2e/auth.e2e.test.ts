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
    it("---", async () => {
        await request(app).delete("/testing/all-data")

        const registration  = await request(app).post("/auth/registration")
            .send({

            "login":"_I147aKCJ",
            "password":"123456",
            "email":"ul_tray@bk.ru"

            }).expect(204)

    //     console.log(registration.body)
    //
    //     /*const user  = await usersCollection.findOne({
    //         "accountData.login": "_I147aKCJ"
    //     })*/
    //     const user  = (await usersCollection.find({}).toArray())[0]
    //     console.log(user, "user")
    //     const firstCode = user.emailConfirmation!.confirmationCode
    //
    //     const registrationResend  = await request(app).post("/auth/registration-email-resending")
    //         .send({
    //             "email":"ul_tray@bk.ru"
    //         }).expect(204)
    //
    //     const userAfterResend  = (await usersCollection.find({}).toArray())[0]
    //     console.log(userAfterResend, "user")
    //     const secondCode = userAfterResend.emailConfirmation!.confirmationCode
    //     console.log({firstCode, secondCode}, " comparing two codes")
    //     expect(firstCode).not.toEqual(secondCode)
    //     await request(app).post("/auth/registration-confirmation")
    //         .send({
    //             code: firstCode
    //         }).expect(400)
    //     const registrationConfirm =  await request(app).post("/auth/registration-confirmation")
    //         .send({
    //             code: secondCode
    //         }).expect(204)
    })



})