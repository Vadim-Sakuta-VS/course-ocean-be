import requestIp from 'request-ip';
import { UAParser } from 'ua-parser-js';
import type { Request } from 'express';

export const getClientMetadata = (req: Request) => {
  const ipAddress = requestIp.getClientIp(req);
  const userAgentInfo = UAParser(req.headers);

  return { ipAddress, userAgentInfo };
};
