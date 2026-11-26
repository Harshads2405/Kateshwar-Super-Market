import { NextResponse } from "next/server";

// TODO: Implement admin product creation with validation and authorization.
export async function POST() {
  return NextResponse.json(
    { message: "Admin product creation endpoint is not implemented yet." },
    { status: 501 }
  );
}
