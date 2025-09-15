import multer from 'multer';


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const uploadImages = upload.array('images');


export default uploadImages;