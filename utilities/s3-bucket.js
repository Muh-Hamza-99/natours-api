const fs = require("fs");

const S3 = require("aws-sdk/clients/s3");

const s3_bucket = new S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const uploadFile = file => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key: file.filename,
    };
    return s3_bucket.upload(uploadParams).promise();
};

const getFileStream = fileKey => {
    const downloadParams = {
        Key: fileKey,
        Bucket: process.env.AWS_BUCKET_NAME,
    };
    return s3_bucket.getObject(downloadParams).createReadStream();
};

const deleteFile = fileKey => {
    const deleteParams = {
        Key: fileKey,
        Bucket: process.env.AWS_BUCKET_NAME,
    };
    return s3_bucket.deleteObject(deleteParams).promise();
};

module.exports = {
    uploadFile,
    getFileStream,
    deleteFile,
};