import { NextApiRequest, NextApiResponse } from 'next';
import jsonwebtoken from 'jsonwebtoken';
import { Gender, CarType } from '../model';

type Role = 'admin' | 'driver' | 'facilitator';

interface Claims {
  userId: string;
  email: string;
  roles: Role[];
  name: string;
  driverGender?: Gender;
  carType?: CarType;
}

export function requireDriverPermissions(
  claims: Claims,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const driver = hasRole(claims, 'driver');

  if (!driver) {
    console.log(
      'WARNING: unauthorised attempt to access driver-only api: ' +
        req.method +
        ' ' +
        req.url
    );
    res.status(403).send('Unauthorized');
    return false;
  }

  return true;
}

export function requireFacilitatorPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  claims: Claims = decodeJwt(req)
) {
  const isAdmin = hasRole(claims, 'admin');
  const isFacilitator = hasRole(claims, 'facilitator');
  if (!isAdmin && !isFacilitator) {
    console.log(
      'WARNING: unauthorised attempt to access facilitator-only api: ' +
        req.method +
        ' ' +
        req.url
    );
    res.status(403).send('Unauthorized');
    return false;
  }

  return true;
}

export function hasRole(claims: Claims, role: Role) {
  return claims.roles.indexOf(role) >= 0;
}

export function decodeJwt(req: NextApiRequest): Claims {
  try {
    const authHeader =
      req.headers.Authorization ||
      req.headers.authorization ||
      req.query['access_token'];

    if (!authHeader) {
      return;
    }

    const domain = process.env.DOMAIN || 'carpal.org.au';
    const authHeaderParts = (authHeader as string).split(' ');
    const tokenValue = authHeaderParts[1] || authHeaderParts[0];
    // FIXME: This needs to be verify
    let decodedToken = jsonwebtoken.decode(tokenValue);
    console.log(decodedToken);
    if (process.env.UNSAFE_GOD_MODE === 'true') {
      decodedToken = {
        ...decodedToken,
        [`https://${domain}/gender`]: 'male',
        [`https://${domain}/roles`]: ['driver', 'admin', 'facilitator'],
      };
    }
    const claims: Claims = {
      userId: decodedToken.sub,
      email: decodedToken.email,
      roles: decodedToken[`https://${domain}/roles`],
      name: decodedToken.name,
    };

    if (claims.roles.indexOf('driver') >= 0) {
      claims.driverGender = decodedToken[`https://${domain}/gender`];
      claims.carType = decodedToken[`https://${domain}/car`];
    }

    return claims;
  } catch (err) {
    console.log('catch error. Invalid token', err);
  }
}
