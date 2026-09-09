import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import dbConnect from "./lib/mongoose";
import slugify from "slugify";
import { nextCookies } from "better-auth/next-js"

const mongooseConnection = await dbConnect();
const client = mongooseConnection.connection.getClient();

export const auth = betterAuth({
    database: mongodbAdapter(client.db("DevFlow"), { client }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    user: {
        additionalFields: {
            username: { type: "string", required: false, unique: true },
            bio: { type: "string", required: false },
            location: { type: "string", required: false },
            portfolio: { type: "string", required: false },
            reputation: { type: "number", required: false, defaultValue: 0 },
        },
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (!user.username) {
                        const base = slugify(user.name || user.email.split("@")[0], {
                            lower: true,
                            strict: true,
                        });
                        const generatedUsername = `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
                        return { data: { ...user, username: generatedUsername } };
                    }
                    return { data: user };
                },
            },
        },
    },
    plugins: [nextCookies()]
});