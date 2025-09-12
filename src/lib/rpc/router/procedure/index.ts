import { onError } from "@orpc/server";
import { base } from "../context";
import asset from "./asset";
import captcha from "./captcha";
import healthcheck from "./healthcheck";
import track from "./track";
import user from "./user";

export default base
  .use(
    onError((error, { context }) => {
      context.logger.error(error, "rpc error");
    }),
  )
  .router({
    healthcheck, // unauthenticated
    captcha, // unauthenticated
    asset, // authenticated, only download public assets is unauthenticated
    user, // authenticated
    track, // authenticated
  });
