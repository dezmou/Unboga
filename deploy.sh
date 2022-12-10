# npm run build;
# cd build;
# scp -r ./*  root@modez.pro:/web/unboga
# cd ..
ssh root@modez.pro "cd Unboga && docker compose down && git pull origin master && docker compose up --build -d"
