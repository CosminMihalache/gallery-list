import { connectToDatabase } from '@/lib/mongodb';
import { GridFSBucket, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const bucket = new GridFSBucket(db, { bucketName: 'images' });
  const { id } = req.query;

  if (req.method === 'GET') {
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    try {
      const downloadStream = bucket.openDownloadStream(new ObjectId(id));

      downloadStream.on('data', (chunk) => {
        res.write(chunk);
      });

      downloadStream.on('end', () => {
        res.end();
      });

      downloadStream.on('error', (error) => {
        console.error('Download stream error:', error);
        if (error.code === 'ENOENT') {
          res.status(404).json({ error: 'Image not found' });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
      });
    } catch (error) {
      console.error('Catch error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
