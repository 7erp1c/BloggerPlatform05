import {Request, Response, Router} from "express";
import {authTokenMiddleware} from "../../middleware/authTokenUser";


export const commentsRouter = Router({})

// commentsRouter
//     .post('/commentId', authTokenMiddleware, async (req, res) => {
//         const newUser = await CommentsService.sendComment(req.dody.comment, req.user!.id)
//         res.status(201).send(newUser)
//     })
//     .get('/commentId', async (req, res) => {
//         const users = await CommentsService.allComments()
//         res.send(users)
//     })
//     .delete('/id',authTokenMiddleware, async(req,res)=>{
//
// })