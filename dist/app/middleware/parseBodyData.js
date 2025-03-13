"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBodyMiddleware = void 0;
const parseBodyMiddleware = (req, res, next) => {
    if (req.body.bodyData) {
        // console.log(req.body.bodyData);
        try {
            req.body = JSON.parse(req.body.bodyData);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Invalid JSON format in bodyData",
            });
        }
    }
    next();
};
exports.parseBodyMiddleware = parseBodyMiddleware;
