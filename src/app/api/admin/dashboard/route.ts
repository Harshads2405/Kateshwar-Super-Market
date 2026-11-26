import { NextResponse } from "next/server";

// TODO: Implement admin dashboard with validation and authorization.
export async function GET() {
  return NextResponse.json(
    { message: "Admin dashboard endpoint is not implemented yet." },
    { status: 501 }
  );
}
