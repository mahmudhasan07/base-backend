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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import app from "./app";
// import seedSuperAdmin from "./app/DB";
const index_1 = __importDefault(require("./config/index"));
const PrismaConnection_1 = require("./app/DB/PrismaConnection");
const app_1 = __importDefault(require("./app"));
const port = index_1.default.port || 5000;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const server = app_1.default.listen(port, () => {
            console.log("Sever is running on port ", port);
            (0, PrismaConnection_1.PrismaConnection)();
        });
        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    console.info("Server closed!");
                });
            }
            process.exit(1);
        };
        process.on("uncaughtException", (error) => {
            console.log(error);
            exitHandler();
        });
        process.on("unhandledRejection", (error) => {
            console.log(error);
            exitHandler();
        });
    });
}
main();
