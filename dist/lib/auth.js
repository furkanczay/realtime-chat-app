"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const better_auth_1 = require("better-auth");
const prisma_1 = require("better-auth/adapters/prisma");
const next_js_1 = require("better-auth/next-js");
const plugins_1 = require("better-auth/plugins");
const prisma_2 = __importDefault(require("./prisma"));
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, prisma_1.prismaAdapter)(prisma_2.default, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    plugins: [(0, next_js_1.nextCookies)(), (0, plugins_1.username)()],
    emailAndPassword: {
        enabled: true,
    },
});
