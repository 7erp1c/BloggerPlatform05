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
    it("registration - email ", async()=>{
        // Очистка данных
        await request(app).delete("/testing/all-data")
        // Регистрация и создание user
        const registration = await request(app).post("/auth/registration")
            .send({
                "login": "_I147aKCJ",
                "password": "123456",
                "email": "ul_tray@bk.ru"
            }).expect(204)
             console.log(registration.body)

            /*const user  = await usersCollection.findOne({
                "accountData.login": "_I147aKCJ"
            })*/
            const user  = (await usersCollection.find({}).toArray())[0]
            console.log(user, "user")
            const firstCode = user.emailConfirmation!.confirmationCode

            const registrationResend  = await request(app).post("/auth/registration-email-resending")
                .send({
                    "email":"ul_tray@bk.ru"
                }).expect(204)

            const userAfterResend  = (await usersCollection.find({}).toArray())[0]
            console.log(userAfterResend, "user")
            const secondCode = userAfterResend.emailConfirmation!.confirmationCode
            console.log({firstCode, secondCode}, " comparing two codes")
            expect(firstCode).not.toEqual(secondCode)
            await request(app).post("/auth/registration-confirmation")
                .send({
                    code: firstCode
                }).expect(400)
            const registrationConfirm =  await request(app).post("/auth/registration-confirmation")
                .send({
                    code: secondCode
                }).expect(204)
    })

    let testAccessToken:  string ;
    let testRefreshToken:  string ;
    it("---", async () => {
        // Очистка данных
        await request(app).delete("/testing/all-data")
        // Регистрация и создание user
        const registration = await request(app)
            .post("/auth/registration")
            .send({
                "login": "_I147aKCJ",
                "password": "123456",
                "email": "ul_tray@bk.ru"
            }).expect(204)
        // Аутентификация пользователя и ожидание 200 статуса и возврата объекта с accessToken
        const authLogin = await request(app)
            .post("/auth/login")
            .send({
                "loginOrEmail": "ul_tray@bk.ru",
                "password": "123456"
            })
            .expect(200)
        testAccessToken = authLogin.body.accessToken;
        console.log("ACCESSTOKEN: " + testAccessToken)
        // Проверка, что accessToken присутствует в ответе
        expect(testAccessToken).toBeDefined();
        // Проверка, что refreshToken добавлен в куки
        const cookies = authLogin.header["set-cookie"];
        // Поиск refreshToken в куках
        for (let cookie of cookies) {
            if (cookie.includes("refreshToken")) {
                testRefreshToken = cookie;
                break;
            }
        }
        console.log("refreshToken: " + testRefreshToken)
        expect(testRefreshToken).toBeDefined();

        const testTokenRefreshSplit = testRefreshToken.split('refreshToken=')[1].split(';')[0]

        const authRefreshToken = await request(app)
            .post("/auth/refresh-token")
            .set("Cookie", testTokenRefreshSplit)
            .expect(200)



    })


})