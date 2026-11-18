import { cookies } from "next/headers";


export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const response = new Response(JSON.stringify({ message: "Hello World" }), {
            status: 200,
        });
        cookieStore.delete("access-token");
        cookieStore.delete("refresh-token")
        return response;
    } catch (error) {
        return new Response(JSON.stringify({ message: "Error" }), {
            status: 500,
        });
    }
}