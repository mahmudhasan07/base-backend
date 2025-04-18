import { Request } from "express";

export const paginationSystem = async(result: any, req: Request) => {

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;

    const data = result.slice((page - 1) * limit, page * limit);
    const total = result.length;
    const totalPage = Math.ceil(result?.length / limit);

    return { data, limit, page, total, totalPage }

}