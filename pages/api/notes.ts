import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from '../../lib/prisma';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthenticated request' });
  }
  let result = null;
  switch (req.method) {
    case 'GET':
      result = await prisma.note.findMany({
        orderBy: [
          {
            dateEdited: 'desc'
          }
        ],
        where: {
          author: { email: session?.user.email },
        },
      });
      break;

    case 'POST':
      const { title, content } = req.body;
      result = await prisma.note.create({
        data: {
          title,
          content,
          author: { connect: { email: session?.user.email } },
        },
      });
      break;

    case 'PUT':
      const data = req.body;
      result = await prisma.note.update({
        where: {
          id: data.id,
        },
        data,
      });
      break;
      
    case 'DELETE':
      const { id } = req.body;
      result = await prisma.note.delete({
        where: {
          id: id,
        },
      });
      break;

    default:
      res.status(404);
      break;
  }
  return res.json(result);
};
