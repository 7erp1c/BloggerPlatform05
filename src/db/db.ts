import dotenv from "dotenv";
import * as e from "express";
import {Db, MongoClient} from "mongodb";
import {createUserAccountThroughAuth} from "../model/usersType/inputModelTypeUsers";
import {blogsView} from "../model/blogsType/blogsView";
import {PostsView} from "../model/postsType/postsView";
import {CommentView} from "../model/commentsType/commentsView";
import {OldTokenDB} from "../model/authType/authType";
import {appConfig} from "../setting";


dotenv.config()

const mongoURI = process.env.MONGO_URL || 'http://localhost:27017'
console.log(process.env.MONGO_URL)
if(!mongoURI){
    throw new Error("URL doesn\'t found")
}

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
            blogCollection:this.getDbName().collection<blogsView>("blogs"),
            postCollection:this.getDbName().collection<PostsView>("posts"),
            usersCollection:this.getDbName().collection<createUserAccountThroughAuth>("users"),
            commentsCollection:this.getDbName().collection<CommentView>("comments"),
            refreshTokenCollection:this.getDbName().collection<OldTokenDB>("old-old-token")

        }
    }

}
//export let dbName = db.getDbName();

export const connectToDB = async () => {
    try {
        await db.run(mongoURI)
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)
        await db.stop()
        return false
    }
}
