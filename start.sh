cd /tmp

# try to remove the repo if it already exists

rm -rf mqtt; true

git clone https://github.com/jensoleg/mqtt.git

cd ./mqtt

npm install --unsafe-perm --production

if [ -z "$APP" ]; then
    export APP=app.js
fi

pm2 start -x $APP --no-daemon