npm run build
scp -r ./dist ubuntu@43.136.59.48:/home/ubuntu/kamanote
rm -rf ./dist
