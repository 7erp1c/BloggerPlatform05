import {
    SearchUsersEmailRepositoryType,
    SearchUsersLoginRepositoryType,
    SortUsersRepositoryType,
    UsersInputType,
    UserViewModelType
} from "../model/usersType/inputModelTypeUsers";
import { usersCollection} from "../db/mongo-db";
import {getUsersView} from "../model/usersType/getUsersView";

export const UsersQueryRepository = {

        async findFullUsers(sortData: SortUsersRepositoryType,searchLogin: SearchUsersLoginRepositoryType,searchEmail:SearchUsersEmailRepositoryType): Promise<UserViewModelType> {
            let searchKey = {};
            let sortKey = {};
            let sortDirection: number;

            // есть ли у search.....Term параметр создания ключа поиска
            // if (searchLogin.searchLoginTerm) searchKey = {login: {$regex: searchLogin.searchLoginTerm,$options:"i"}};
            //             // if (searchEmail.searchEmailTerm) searchKey = {email: {$regex: searchEmail.searchEmailTerm,$options:"i"}};
            if (searchLogin.searchLoginTerm || searchEmail.searchEmailTerm) {
                searchKey = {
                    $or: [
                        searchLogin.searchLoginTerm ? { login: { $regex: searchLogin.searchLoginTerm, $options: "i" } } : {},
                        searchEmail.searchEmailTerm ? { email: { $regex: searchEmail.searchEmailTerm, $options: "i" } } : {}
                    ]
                };
            }
            // рассчитать лимиты для запроса к DB
            const documentsTotalCount = await usersCollection.countDocuments(searchKey); // Получите общее количество блогов
            const pageCount = Math.ceil(documentsTotalCount / +sortData.pageSize); // Рассчитайте общее количество страниц в соответствии с размером страницы
            const skippedDocuments = (+sortData.pageNumber - 1) * +sortData.pageSize; // Подсчитать количество пропущенных документов перед запрошенной страницей

            // имеет ли SortDirection значение "desc", присвойте SortDirection значение -1, в противном случае присвойте 1
            if (sortData.sortDirection === "desc") sortDirection = -1;
            else sortDirection = 1;

            // существуют ли поля
            if (sortData.sortBy === "login") sortKey = {login: sortDirection};
            else if (sortData.sortBy === "email") sortKey = {email: sortDirection};
            else sortKey = {createdAt: sortDirection};

            // Получать документы из DB
            const users: UsersInputType[] = await usersCollection.find(searchKey).sort(sortKey).skip(+skippedDocuments).limit(+sortData.pageSize).toArray();

            return {
                pagesCount: pageCount,
                page: +sortData.pageNumber,
                pageSize: +sortData.pageSize,
                totalCount: documentsTotalCount,
                items: users.map(getUsersView)
            }
        }}