

import * as e from "express";
import {Db, MongoClient} from "mongodb";
import {createUserAccountThroughAuth} from "../../../model/usersType/inputModelTypeUsers";

const appConfig = {
    DB_NAME: "comments"
};
//логика работы MongoMemoryServer:
export const db = {
    client: {} as MongoClient,

    getDbName(): Db {

        return this.client.db(appConfig.DB_NAME)
    },
    async run(url: string) {//метод подключения к db
        try {
            this.client = new MongoClient(url)// создаём клиент монго клиент и подкидываем url

            await this.client.connect();//конектимся
            console.log('client', this.client)
            await this.getDbName().command({ping: 1});//?
            console.log('Connected successfully to mongo server', e)
        } catch (e: unknown) {
            console.error("Can't connect to mongo server", e)

            await this.client.close();
        }
    },
    async stop() {//метод стоп
        await this.client.close();
        console.log('Connected successfully closed')
    },
    async drop() { //метод берет все коллекции и чистит
        try {
            //await this.getName().dropDatabase()//для использования этого метода, нужны права админа
            const collections = await this.getDbName().listCollections().toArray()//берем все коллекции

            for (const collection of collections) {//проходим циклом и получаем имя каждой коллекции
                const collectionName = collection.name;
                await this.getDbName().collection(collectionName).deleteMany({})
            }
        } catch (e: unknown) {
            console.error('Error in drop db:', e)
            await this.stop()
        }
    },
    getCollections(){
        return{
            commentsCollection:this.getDbName().collection<createUserAccountThroughAuth>("users")
        }
    }

}