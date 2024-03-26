import {body, check, oneOf} from "express-validator";
import { blogCollection } from "../db/mongo-db";






export const blogsValidation = [
body('name').trim().isString().isLength({min:1,max:15}),
body('description').trim().isString().isLength({min:1,max:500}),
body('websiteUrl').trim().isString().isLength({min:1,max:100})
    .matches(new RegExp("^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$")).bail()
// body('createdAt').isString()
//     .matches(new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$"))
]

export const postsValidation = [
body('title').trim().isString().isLength({min:1,max:30}).bail(),
body('shortDescription').trim().isString().isLength({min:1,max:100}).bail(),
body('content').trim().isString().isLength({min:1,max:1000}).bail(),
body('blogId').trim().isString().custom(
    async (value) => {
        const blog = await blogCollection.findOne({  id: value  });
        if (!blog) {
            throw new Error("Blog not found");
        }
        return value;
    }
).bail()
    // body('createdAt').isString()
    //     .matches(new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$"))
]

export const blogPostValidation = [
    body('title').trim().isString().isLength({min:1,max:30}).bail(),
    body('shortDescription').trim().isString().isLength({min:1,max:100}).bail(),
    body('content').trim().isString().isLength({min:1,max:1000}).bail(),
    // body('createdAt').isString()
    //     .matches(new RegExp("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d{3}Z$"))
]
 export const usersValidation =[
 body('login').trim().isString().isLength({min:3,max:10}).bail(),
 body('password').trim().isString().isLength({min:6,max:20}).matches(new RegExp("^[a-zA-Z0-9_-]*$")).bail(),
 body('email').trim().isString()
     .matches(new RegExp("^[\\w\\.\\-]+@[\\w\\.\\-]+\\.[a-zA-Z]{2,4}$")).bail()
 ]

export const authValidation = [
    // oneOf([
    //     check('loginOrEmail').trim().isString().isLength({min:3,max:10}).bail(),
    //     check('loginOrEmail').trim().isString()
    //         .matches(new RegExp("^[\\w\\.\\-]+@[\\w\\.\\-]+\\.[a-zA-Z]{2,4}$")).bail()
    // ]),
    body('loginOrEmail').trim().isString().isLength({min:3,max:10}).bail(),
    // body('loginOrEmail').custom((value,{req})=>{
    //     if(value.includes('@')){
    //         req.checkBody('loginOrEmail').trim().isString()
    //              .matches(new RegExp("^[\\w\\.\\-]+@[\\w\\.\\-]+\\.[a-zA-Z]{2,4}$")).bail()
    //
    //     }else{
    //         req.checkBody('loginOrEmail').trim().isString().isLength({min:3,max:10}).bail()
    //     }
    //     return true
    //
    // }),
    body('password').trim().isString().isLength({min:6,max:20}).matches(new RegExp("^[a-zA-Z0-9_-]*$")).bail()

]


