if [ "$1" = "" ]; then echo "Missing argument: Data dump directory missing."; exit 0; fi;
mongodump --db sts-dev --out $1
