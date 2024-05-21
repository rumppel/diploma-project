const formidable = require("formidable");
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, S3 } = require("@aws-sdk/client-s3");
const Transform = require('stream').Transform;
require('dotenv').config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;
console.log(region);
const router = async (req) => {
    return new Promise((resolve, reject) => {
        let options = {
            maxFileSize: 100 * 1024 * 1024, // 100 мегабайт у байтах
            allowEmptyFiles: false
        };

        const form = formidable(options);

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err.message);
            }
        });

        form.on('error', error => {
            reject(error.message);
        });

        form.on('data', data => {
            if (data.name === "complete") {
                resolve(data.value);
            }
        });

        form.on('fileBegin', (formName, file) => {
            file.open = async function () {
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk);
                    }
                });

                this._writeStream.on('error', e => {
                    form.emit('error', e);
                });

                new Upload({
                    client: new S3Client({
                        credentials: {
                            accessKeyId,
                            secretAccessKey
                        },
                        region
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        Key: `${Date.now().toString()}-${this.originalFilename}`,
                        Body: this._writeStream
                    },
                    tags: [], // необов'язкові теги
                    queueSize: 4, // необов'язкове налаштування паралельності
                    partSize: 1024 * 1024 * 5, // необов'язковий розмір кожної частини, у байтах, мінімум 5MB
                    leavePartsOnError: false, // необов'язкове ручне оброблення пропущених частин
                })
                .done()
                .then(data => {
                    form.emit('data', { name: "complete", value: data });
                }).catch((err) => {
                    form.emit('error', err);
                });
            };

            file.end = function (cb) {
                this._writeStream.on('finish', () => {
                    this.emit('end');
                    cb();
                });
                this._writeStream.end();
            };
        });
    });
};

module.exports = router;