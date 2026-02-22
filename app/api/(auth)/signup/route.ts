import { NextResponse,NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/zod/register";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password} = registerSchema.parse(body);

        console.log("Received registration data:", { email });

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        console.log("Existing user check:", { existingUser });
        if(existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            }
        });
        return NextResponse.json({ message: "User registered successfully", user }, { status: 201 });

    } catch (error) {
        console.error("Error during registration:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}