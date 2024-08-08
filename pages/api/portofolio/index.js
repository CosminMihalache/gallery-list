
import { connectToDatabase } from '../../../lib/mongodb';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';


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

  if (req.method === 'POST') {
    uploadMiddleware(req, res, async (err) => {
      if (err) return res.status(500).json({ error: 'Upload failed' });

      const { title, description, clientLink, isVisible } = req.body;
      const imageFile = req.file;

      let imageId = null;
      if (imageFile) {
        const uploadStream = bucket.openUploadStream(imageFile.originalname, {
          contentType: imageFile.mimetype,
        });
        uploadStream.end(imageFile.buffer);
        imageId = uploadStream.id;
      }

      const result = await db.collection('portfolios').insertOne({
        title,
        description,
        imageId, 
        clientLink,
        isVisible,
      });

      res.status(201).json(result);
    });
  } else if (req.method === 'GET') {
    const portfolios = await db.collection('portfolios').find({}).toArray();
    res.status(200).json(portfolios);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
