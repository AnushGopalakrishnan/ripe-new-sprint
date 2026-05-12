import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  (await draftMode()).disable();

  const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
  return NextResponse.redirect(new URL(redirectTo, request.url));
}
