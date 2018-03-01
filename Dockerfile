FROM asciidoctor/docker-asciidoctor

WORKDIR /root

RUN 	   apk add --no-cache nodejs-npm \
        && npm install --save express multer serve-index pug replace-ext \
	&& mkdir upload

COPY upload.js upload.html ./

CMD [ "node", "upload.js" ]
