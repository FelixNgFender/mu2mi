import { StandardRPCJsonSerializer } from "@orpc/client/standard";

// https://orpc.unnoq.com/docs/integrations/tanstack-query#hydration
export const serializer = new StandardRPCJsonSerializer({
  customJsonSerializers: [],
});
