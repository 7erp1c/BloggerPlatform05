// Реализовать после тестов!!!!!!!!!!!!!!!!
// import {Db, MongoClient} from "mongodb";
// import * as e from "express";
// import {createUserAccountThroughAuth} from "../../../src/model/usersType/inputModelTypeUsers";
// //логика работы MongoMemoryServer:
// export const dbMongoMemory = {
//     client: {} as MongoClient,
//
//     getDbName(): Db {
//
//         return this.client.dbMongoMemory(appConfig.DB_NAME)
//     },
//     async run(url: string) {
//         try {
//             this.client = new MongoClient(url)
//
//             await this.client.connect();
//             console.log('client', this.client)
//             await this.getDbName().command({ping: 1});
//             console.log('Connected successfully to mongo server', e)
//         } catch (e: unknown) {
//             console.error("Can't connect to mongo server", e)
//
//             await this.client.close();
//         }
//     },
//     async stop() {
//         await this.client.close();
//         console.log('Connected successfully closed')
//     },
//     async drop() {
//         try {
//             //await this.getName().dropDatabase()//для использования этого метода, нужны права админа
//             const collections = await this.getDbName().listCollections().toArray()//берем все коллекции
//
//             for (const collection of collections) {//проходим циклом и получаем имя каждой коллекции
//                 const collectionName = collection.name;
//                 await this.getDbName().collection(collectionName).deleteMany({})
//             }
//         } catch (e: unknown) {
//             console.error('Error in drop db:', e)
//             await this.stop()
//         }
//     },
//     getCollections(){
//         return{
//             usersCollection:this.getDbName().collection<createUserAccountThroughAuth>("users")
//         }
//     }
//
// }