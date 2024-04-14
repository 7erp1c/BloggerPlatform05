import request from "supertest";
export const user1 = {
    "login": "_I147aKCJ",
    "password": "123456",
    "email": "ul_tray@bk.ru"
}
export const CreateUser = async (app:any)=>{
    const create = await request(app).post("/auth/registration")
        .send({
            "login": "_I147aKCJ",
            "password": "123456",
            "email": "ul_tray@bk.ru"
        })
        .expect(204)
}