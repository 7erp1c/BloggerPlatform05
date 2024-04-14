import {app} from "./app";
import dotenv from 'dotenv'
import {connectToDB} from "./db/mongo-db";

dotenv.config()


const port = process.env.PORT || 4000

export const startApp = async() => {
    await connectToDB()
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)

    })
}

 startApp()

