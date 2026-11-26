import { NextResponse } from "next/server";

// TODO: Implement admin order listing with validation and authorization.
export async function GET() {
  return NextResponse.json(
    { message: "Admin order listing endpoint is not implemented yet." },
    { status: 501 }
  );
}
