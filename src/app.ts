import express, { Request, Response} from 'express'
import {blogsRouter} from "./router/blogs-router";
import {postsRouter} from "./router/posts-router";
import {usersRouter} from "./router/users-router";
import { db} from './db/mongo-db';
import { authRouter } from './router/auth-router';
export const app = express()

app.use(express.json())
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth/login', authRouter)


app.get('/', (req: Request, res: Response) => {
    res
        .status(200)
        .json({x: "x1"})

})
app.delete('/testing/all-data', async (req, res) => {
    try {
        await db.dropDatabase();
        res.sendStatus(204); // Отправляем статус 204 после успешного удаления базы данных
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // Если возникла ошибка, отправляем статус 500
    }

})
