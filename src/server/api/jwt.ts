import { NextApiRequest, NextApiResponse } from 'next';
import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Gender, CarType } from '../../common/model';

type Role = 'admin' | 'driver' | 'facilitator';

const client = jwksClient({
  jwksUri: 'https://hills-carpal.au.auth0.com/.well-known/jwks.json',
});

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

export async function requireFacilitatorPermissions(
  req: NextApiRequest,
  res: NextApiResponse,
  claims?: Claims
) {
  if (!claims) {
    claims = await decodeJwt(req);
  }

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

export async function decodeJwt(req: NextApiRequest): Promise<Claims> {
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
    let decodedToken: any = await new Promise((resolve, reject) =>
      jsonwebtoken.verify(
        tokenValue,
        (header: any, callback: (error?: Error, value?: string) => {}) => {
          client.getSigningKey(header.kid, (err: Error, key: any) => {
            if (err) {
              callback(err);
            } else {
              const signingKey = key.publicKey || key.rsaPublicKey;
              callback(null, signingKey);
            }
          });
        },
        {},
        (err: Error, decoded: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded);
          }
        }
      )
    );

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
