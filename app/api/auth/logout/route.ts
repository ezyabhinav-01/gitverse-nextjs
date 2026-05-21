import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/middleware";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json"},
        { status: 400 }
      );
    }

    try {
      await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload"},
        { status: 400 }
      );
    }

    //Authentication user
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 });
    }

  //Logout response

  // In a stateless JWT setup, logout is handled client-side by removing the token
  // We can optionally implement token blacklisting here if needed

  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

} catch (error) {
    console.error("Logout API Error:", error);

    //prevent stack trace from reaching client
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 400 }
    );
  }
}