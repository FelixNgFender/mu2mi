import { internalServerError, success } from "@/lib/response";
import { client } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await client.healthcheck.execute();
  if (error) {
    return internalServerError();
  }
  return success(data);
}
