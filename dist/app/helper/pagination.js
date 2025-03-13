"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationSystem = void 0;
const paginationSystem = (result, req) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const data = result.slice((page - 1) * limit, page * limit);
    const total = result.length;
    const totalPage = Math.round((result === null || result === void 0 ? void 0 : result.length) / limit);
    return { data, limit, page, total, totalPage };
});
exports.paginationSystem = paginationSystem;
