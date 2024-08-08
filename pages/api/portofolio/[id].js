import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const { id } = req.query;

  if (req.method === 'GET') {
    const portfolio = await db.collection('portfolios').findOne({ _id: new ObjectId(id) });
    if (portfolio && portfolio.image) {
      res.setHeader('Content-Type', portfolio.image.contentType);
      res.status(200).send(portfolio.image.data);
    } else {
      res.status(404).json({ error: 'Portfolio or image not found' });
    }
  } else if (req.method === 'PUT') {
    
    const { title, description, clientLink, isVisible } = req.body;

    
    if (req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);

      await db.collection('portfolios').updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, description, image: { data: imageBuffer, contentType: req.file.mimetype }, clientLink, isVisible } }
      );

      fs.unlinkSync(req.file.path); 
    } else {
      await db.collection('portfolios').updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, description, clientLink, isVisible } }
      );
    }

    res.status(200).json({ id });
  } else if (req.method === 'DELETE') {
    await db.collection('portfolios').deleteOne({ _id: new ObjectId(id) });
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
