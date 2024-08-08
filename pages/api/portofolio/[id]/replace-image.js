import { connectToDatabase } from '@/lib/mongodb';
import multer from 'multer';
import { GridFSBucket, ObjectId } from 'mongodb';

const upload = multer({ storage: multer.memoryStorage() });

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadMiddleware = upload.single('image');

export default async function handler(req, res) {
  const { db } = await connectToDatabase();
  const bucket = new GridFSBucket(db, { bucketName: 'images' });

  if (req.method === 'PUT') {
    uploadMiddleware(req, res, async (err) => {
      if (err) return res.status(500).json({ error: 'Upload failed' });

      const { id } = req.query;
      const imageFile = req.file;

      if (!imageFile) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      
      const existingPortfolio = await db.collection('portfolios').findOne({ _id: new ObjectId(id) });
      if (existingPortfolio && existingPortfolio.imageId) {
        await bucket.delete(existingPortfolio.imageId);
      }

      
      const uploadStream = bucket.openUploadStream(imageFile.originalname, {
        contentType: imageFile.mimetype,
      });
      uploadStream.end(imageFile.buffer);
      const imageId = uploadStream.id;

      
      await db.collection('portfolios').updateOne(
        { _id: new ObjectId(id) },
        { $set: { imageId } },
      );

      res.status(200).json({ imageId });
    });
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
