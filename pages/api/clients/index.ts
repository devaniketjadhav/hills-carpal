import { NextApiRequest, NextApiResponse } from 'next';

import ClientRepository from '../../../src/api/clients/client-repository';
import DatabaseManager from '../../../src/api/database/database-manager';
import { requireFacilitatorPermissions } from '../../../src/auth/jwt';

const databaseManager = new DatabaseManager();
const clientRepository = new ClientRepository(databaseManager);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, body } = req;

  const connection = databaseManager.createConnection();
  try {
    if (requireFacilitatorPermissions(req, res)) {
      switch (method) {
        case 'GET':
          const clients = await clientRepository.list(connection);
          res.status(200).json(clients);

          break;
        case 'POST':
          const result = await clientRepository.create(body, connection);

          res.status(200).json({
            ...body,
            id: result,
          });

          break;

        // case 'PUT':
        //   // Update or create data in your database
        //   res.status(200).json({ id, name: name || `User ${id}` });
        //   break;
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT']);
          res.status(405).end(`Method ${method} Not Allowed`);
      }
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: 'Error' });
  } finally {
    await databaseManager.closeConnection(connection);
  }
};