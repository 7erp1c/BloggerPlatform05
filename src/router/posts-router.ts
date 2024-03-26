import {Request, Response, Router} from "express";
import {RequestWithBlogsPOST, RequestWithDelete, RequestWithPostsPOST} from "../typeForReqRes/helperTypeForReq";
import {postsCreateAndPutModel} from "../typeForReqRes/postsCreateAndPutModel";
import {_delete_all_} from "../typeForReqRes/blogsCreateAndPutModel";
import {PostsService} from "../domain/posts-server";
import {authGuardMiddleware} from "../middleware/authGuardMiddleware";
import {postsValidation} from "../middleware/inputValidationMiddleware";
import {errorsValidation} from "../middleware/errorsValidation";
import {QueryBlogRequestType} from "../model/blogsType/blogsView";
import {QueryPostRequestType, SortPostRepositoryType} from "../model/postsType/postsView";
import {PostsQueryRepository} from "../repositories/posts-query-repository";



export const postsRouter = Router({})
postsRouter.get('/', async (req: RequestWithBlogsPOST<QueryPostRequestType>, res: Response) => {
    const query: QueryBlogRequestType = req.query
    const sortData: SortPostRepositoryType = {
        sortBy: query.sortBy || "createdAt",
        sortDirection: query.sortDirection || "desc",
        pageNumber: query.pageNumber || 1,
        pageSize: query.pageSize || 10
    }

    const posts = await PostsQueryRepository.getAllPosts(sortData);
    res.status(200).json(posts);
})

postsRouter.post('/', authGuardMiddleware, postsValidation, errorsValidation, async (req: RequestWithPostsPOST<postsCreateAndPutModel>, res: Response) => {
    const newPostsFromRep = await PostsService
        .createPosts( req.body.title, req.body.shortDescription, req.body.content, req.body.blogId)//как сократить

    res.status(201).send(newPostsFromRep)
})
//

postsRouter.get('/:id', async (req: Request, res: Response) => {
    const foundPostsFromRep = await PostsService.findPostsByID(req.params.id)
    if (!foundPostsFromRep) {
        res.sendStatus(404)
        return;
    }else{
        res.send(foundPostsFromRep)
        return
    }
})


postsRouter.put('/:id', authGuardMiddleware, postsValidation, errorsValidation, async (req: Request, res: Response) => {
    const rB = req.body
    const isUpdatePosts = await PostsService.updatePosts(req.params.id, rB.title, rB.shortDescription, rB.content, rB.blogId)

    if (isUpdatePosts) {
        res.status(204).send()
        return
    }
    if(!isUpdatePosts){
        res.status(404).send()
        return
    }

})


postsRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithDelete<_delete_all_>, res: Response) => {

    const isDelete = await PostsService.deletePosts(req.params.id)
    if (isDelete) {
        res.sendStatus(204)//Not Found
    } else {
        res.sendStatus(404)
    }
})