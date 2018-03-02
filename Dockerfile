FROM asciidoctor/docker-asciidoctor

WORKDIR /root

RUN 	   apk add --no-cache nodejs-npm \
        && npm install --save express multer serve-index pug replace-ext \
	&& mkdir upload

COPY upload.js upload.html ./
COPY views ./views
COPY js ./js

CMD [ "node", "upload.js" ]
