CREATE TABLE IF NOT EXISTS "User" (
    "userId" SERIAL PRIMARY KEY,
    "userName" VARCHAR (255) UNIQUE,
    "name" VARCHAR (255),
    "pwd" VARCHAR (255),
    "roleCode" INTEGER,
    "active" BOOLEAN DEFAULT TRUE,
    "createdTime" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE if NOT EXISTS "Role"(
    "roleCode" INTEGER PRIMARY KEY,
    "desc" TEXT
);
CREATE TABLE IF NOT EXISTS "Food" (
    "foodId" SERIAL PRIMARY KEY,
    "categoryId" INTEGER NOT NULL,
    "name" VARCHAR (255),
    "quantity" INTEGER,
    "price" REAL,
    "active" BOOL,
    "createdTime" TIMESTAMP WITH TIME ZONE DEFAULT NOW (),
    "imgURL" TEXT
);
CREATE TABLE IF NOT EXISTS "Order" (
    "orderId" SERIAL PRIMARY KEY,
    "tableId" INTEGER NOT NULL,
    "orderTime" TIMESTAMP WITH TIME ZONE DEFAULT NOW (),
    "finishTime" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    "payTime" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    "orderedBy" INTEGER NOT NULL,
    "finishedBy" INTEGER DEFAULT NULL,
    "statusCode" SMALLINT
);
CREATE TABLE IF NOT EXISTS "Status" (
    "statusCode" SMALLINT PRIMARY KEY,
    "desc" VARCHAR (255)
);
CREATE TABLE IF NOT EXISTS "OrderFood" (
    "orderId" INTEGER NOT NULL,
    "foodId" INTEGER NOT NULL,
    "quantity" INTEGER,
    "price" REAL,
    PRIMARY KEY ("orderId", "foodId")
);
CREATE TABLE IF NOT EXISTS "Table" (
    "tableId" SERIAL PRIMARY KEY,
    "status" BOOL
);
CREATE TABLE IF NOT EXISTS "Category" (
    "categoryId" SERIAL PRIMARY KEY,
    "name" VARCHAR (255)
);
ALTER TABLE "Food"
ADD FOREIGN KEY ("categoryId") REFERENCES "Category" ("categoryId");
ALTER TABLE "OrderFood"
ADD FOREIGN KEY ("orderId") REFERENCES "Order" ("orderId");
ALTER TABLE "OrderFood"
ADD FOREIGN KEY ("foodId") REFERENCES "Food" ("foodId");
ALTER TABLE "Order"
ADD FOREIGN KEY ("tableId") REFERENCES "Table" ("tableId");
ALTER TABLE "Order"
ADD FOREIGN KEY ("orderedBy") REFERENCES "User" ("userId");
ALTER TABLE "Order"
ADD FOREIGN KEY ("finishedBy") REFERENCES "User" ("userId");
ALTER TABLE "Order"
ADD FOREIGN KEY ("statusCode") REFERENCES "Status" ("statusCode");
ALTER TABLE "User"
ADD FOREIGN KEY ("roleCode") REFERENCES "Role" ("roleCode");
ALTER SEQUENCE public."Table_tableId_seq" RESTART WITH 1;
ALTER SEQUENCE public."User_userId_seq" RESTART WITH 1000000;
ALTER SEQUENCE public."Category_categoryId_seq" RESTART WITH 2000000;
ALTER SEQUENCE public."Food_foodId_seq" RESTART WITH 3000000;
ALTER SEQUENCE public."Order_orderId_seq" RESTART WITH 4000000;