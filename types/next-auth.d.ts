import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface User extends DefaultUser {
        tenantId: string;
    }

    interface Session extends DefaultSession {
        user: {
            id: string;
            name: string;
            image: string;
            tenantId: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        id: string;
        tenantId: string;
    }
}
