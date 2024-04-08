
import request from "supertest"
import {app} from "../../src/app";
import {client, usersCollection} from "../../src/db/mongo-db";
import {body} from "express-validator";




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
        // const mongoServer = await MongoMemoryServer.create() //использование локальной базы данных без демона
        // await db.run(mongoServer.getUri()) // поднимет базу данных
    })
    afterAll(async () => {
        await client.close();
        // await db.stop(); если заюзали MongoMemoryServer
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

    let testAccessToken1:  string;
    let testRefreshToken1:  string;
    let testAccessToken2:  string;
    let testRefreshToken2:  string;

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
        testAccessToken1 = authLogin.body.accessToken;
        // Проверка, что accessToken присутствует в ответе
        expect(testAccessToken1).toBeDefined();
        console.log("__ACCESSTOKEN: " + testAccessToken1)
        // Проверка, что refreshToken добавлен в куки
        const cookiesArray1 = authLogin.header["set-cookie"];
        // Поиск refreshToken в куках
        for (let cookie1 of cookiesArray1) {
            if (cookie1.includes("refreshToken")) {
                testRefreshToken1 = cookie1;
                break;
            }
        }
        console.log("__test refreshToken: " + testRefreshToken1)
        expect(testRefreshToken1).toBeDefined();

        //обновляем пару accessToken и refreshToken, используем "testRefreshToken1":
        const authRefreshToken = await request(app)
            .post("/auth/refresh-token")
            .set("Cookie", testRefreshToken1)
            .expect(200)
        testAccessToken2 = authLogin.body.accessToken;
        // Проверка, что accessToken присутствует в ответе
        expect(testAccessToken2).toBeDefined();
        console.log("__ACCESSTOKEN: " + testAccessToken2)
        // Проверка, что refreshToken добавлен в куки
        const cookiesArray2 = authLogin.header["set-cookie"];
        // Поиск refreshToken в куках
        for (let cookie2 of cookiesArray2) {
            if (cookie2.includes("refreshToken")) {
                testRefreshToken2 = cookie2;
                break;
            }
        }
        console.log("__test refreshToken2: " + testRefreshToken2)
        expect(testRefreshToken2).toBeDefined();

        //получаем информацию о пользователе endpoint: auth/me:
        const authMe = await request(app)
            .get("/auth/me")
            .set("Authorization", `Bearer ${testAccessToken2}`)
            // .send({
            //     "email": "string",
            //     "login": "string",
            //     "userId": "string"
            // })
            .expect(200)




    })


})