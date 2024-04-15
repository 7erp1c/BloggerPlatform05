import {MongoMemoryServer} from 'mongodb-memory-server'
import {db} from "./utils/db";
import {app} from "../../app";
import request from "supertest";


describe("Comments test", () => {
// const startApp = app()

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        const mongoURI = mongoServer.getUri()
        await db.run(mongoURI)//url приходит из MongoMemoryServer
    });

    afterAll(async () => {
        await db.drop();
    })
    afterAll(async () => {
        await db.stop()
    });

    describe("Comments",  () => {

        it("Not receive comments, because userId absent in db", async ()=>{
            await request(app).get("/comments/1232443413")
                .expect(404)
        })

        })

})