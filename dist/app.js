"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myCache = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const secret_1 = require("./config/secret");
const node_cache_1 = __importDefault(require("node-cache"));
const route_1 = __importDefault(require("./app/route/route"));
const globalErrorHandler_1 = __importDefault(require("./app/middleware/globalErrorHandler"));
exports.myCache = new node_cache_1.default({ stdTTL: 180 });
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get('/', (req, res) => {
    res.send('Welcome to development world');
});
app.use("/api/v1", route_1.default);
app.use(globalErrorHandler_1.default);
app.listen(secret_1.prot, () => {
    console.log(`Server is running on port ${secret_1.prot}`);
});
