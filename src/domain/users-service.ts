import {UsersInputType, UsersOutputType} from "../model/usersType/inputModelTypeUsers";
import bcrypt from 'bcrypt'
import {UsersRepository} from "../repositories/usersRepository";
import {ObjectId} from "mongodb";


export const UsersService = {

//post(user)
     async createUser(login:string, email:string,password:string):Promise<UsersInputType>{

          const passwordSalt = await bcrypt.genSalt(10)
          const passwordHash = await this._generateHash(password,passwordSalt)
          let newUser: UsersOutputType = {
               id: new ObjectId().toString(),
               login: login,
               email: email,
               createdAt: new Date().toISOString(),
              passwordSalt,
              passwordHash

          }
          const createdUser = await UsersRepository.createUser(newUser)
         return {
             id: createdUser.id,
             login: createdUser.login,
             email: createdUser.email,
             createdAt: createdUser.createdAt
         }

},
     async checkCredentials(loginOrEmail:string,password:string){
const user = await UsersRepository.findByLoginOrEmail(loginOrEmail)
          if(!user){
               return false
          }
          const passwordHash = await this._generateHash(password,user.passwordSalt)
          if(user.passwordHash !== passwordHash){
               return false
          }
          return true
},
     async _generateHash(password:string,salt:string){
      const hash = await bcrypt.hash(password,salt);
          console.log('hash'+hash);
          return hash;
},
//delete(/id)
          async deleteUser(id: string): Promise<boolean> {
               return await UsersRepository.deleteUser(id)
          }
}