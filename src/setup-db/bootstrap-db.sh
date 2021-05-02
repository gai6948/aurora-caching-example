Mc2Or6a^T.YIOp.pu=EsGZcJqHVa7I

psql -h <aurora_host> \
    -U postgres -f createTable.sql

psql -h <aurora_host> \
    -U postgres -f addData.sql
