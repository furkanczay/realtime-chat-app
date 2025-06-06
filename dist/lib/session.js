"use strict";
"use server";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSession = getSession;
const headers_1 = require("next/headers");
const auth_1 = require("./auth");
async function getSession() {
    return await auth_1.auth.api.getSession({
        headers: await (0, headers_1.headers)(),
    });
}
