import { MongoMemoryServer } from 'mongodb-memory-server'
import {db} from "./utils/db";
import {app} from "../../app";



describe("Comments test", () => {
// const startApp = app()

    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create()
        await db.run( mongoServer.getUri())
    });

    afterAll(async () => {
        await db.drop();
    })
    afterAll(async () => {
        await db.stop()
    });


})