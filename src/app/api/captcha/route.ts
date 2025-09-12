import { httpStatus } from "@/lib/http";
import { client } from "@/lib/rpc";

export async function POST(request: Request) {
  const body = await request.json();
  const { data, error } = await client.captcha.verify(body);
  let status: number;
  if (error) {
    status = httpStatus.clientError.badRequest.code;
  } else if (!data.success) {
    status = httpStatus.clientError.badRequest.code;
  } else {
    status = httpStatus.success.ok.code;
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}
