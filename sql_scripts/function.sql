CREATE OR REPLACE FUNCTION getFoodPagination(
    os IN INTEGER,
    lm IN INTEGER,
    filt IN jsonb
)
    RETURNS TABLE
            (
                foodId      INTEGER,
                name        VARCHAR,
                price       REAL,
                quantity    INTEGER,
                categoryId  INTEGER,
                createdTime TIMESTAMP
            )
AS
$$
SELECT f."foodId", f.name, f.price, f.quantity, f."categoryId", f."createdTime"
FROM "Food" AS f
WHERE (NOT filt ? 'categoryId' OR f."categoryId"::TEXT = filt ->> 'categoryId')
  AND (NOT filt ? 'minPrice' OR f.price >= (filt ->> 'minPrice')::REAL)
  AND (NOT filt ? 'maxPrice' OR f.price <= (filt ->> 'maxPrice')::REAL)
  AND (NOT filt ? 'minQuantity' OR f.quantity >= (filt ->> 'minQuantity')::INTEGER)
  AND (NOT filt ? 'maxQuantity' OR f.quantity <= (filt ->> 'maxQuantity')::INTEGER)
  AND f.active = TRUE
ORDER BY f."foodId"
OFFSET os ROWS FETCH NEXT lm ROWS ONLY;
$$ LANGUAGE sql;
-- thêm order
-- từ order id sẽ theem trong orderFood
-- mỗi item trong orderlist sẽ lấy food id để check và lấy số lượng
CREATE OR REPLACE FUNCTION createOrder(
    tableId INTEGER,
    orderedBy INTEGER,
    foodList jsonb --include foodId and quantity
) RETURNS INTEGER
AS
$$
DECLARE
    _foodId   INTEGER;
    _quantity INTEGER;
    _remain   INTEGER;
    _price    REAL;
    _orderId  INTEGER;
    _cur      REFCURSOR;
BEGIN
    CREATE TEMP TABLE orderedList
    (
        foodId   INTEGER,
        quantity INTEGER,
        remain   INTEGER,
        price    REAL
    ) ON COMMIT DROP;
    INSERT INTO orderedList
    SELECT fl.foodId, fl.quantity, f.quantity, f.price
    FROM JSONB_TO_RECORDSET(LOWER(foodList::TEXT)::jsonb) AS fl(foodId INTEGER, quantity INTEGER)
             INNER JOIN "Food" AS f ON f."foodId" = fl.foodId;

    IF NOT EXISTS(SELECT * FROM orderedList) THEN
        ROLLBACK;
        RETURN 0;
    END IF;

    INSERT INTO "Order"("tableId", "orderedBy", "statusCode")
    VALUES (tableId, orderedBy, 0)
    RETURNING "orderId" INTO _orderId;
    UPDATE "Table" AS T
    SET status = FALSE
    WHERE T."tableId" = tableId;
    OPEN _cur FOR SELECT * FROM orderedList;
    LOOP
        FETCH NEXT FROM _cur INTO _foodId,_quantity,_remain,_price;
        EXIT WHEN NOT FOUND;
        IF _quantity > _remain THEN
            ROLLBACK;
            RETURN 0;
        END IF;

        UPDATE "Food" AS f
        SET quantity = f.quantity - _quantity
        WHERE f."foodId" = _foodId;

        INSERT INTO "OrderFood"
        VALUES (_orderId, _foodId, _quantity, _price);
    END LOOP;

    CLOSE _cur;
    RETURN _orderId;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION getOrder(tableId INTEGER)
    RETURNS TABLE
            (
                orderId    INTEGER,
                statusCode INTEGER,
                orderTime  TIMESTAMP
            )
AS
$$
SELECT o."orderId",
       o."statusCode",
       o."orderTime"
FROM "Order" AS o
WHERE o."tableId" = tableId
ORDER BY o."orderTime" DESC
LIMIT 1
$$
    LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getOrderFood(orderId INTEGER)
    RETURNS TABLE
            (
                foodId   INTEGER,
                NAME     VARCHAR(255),
                quantity INTEGER,
                price    REAL
            )
AS
$$
SELECT tab."foodId",
       food."name",
       tab."quantity",
       tab."price"
FROM (SELECT of."foodId",
             of."quantity",
             of."price"
      FROM "OrderFood" AS OF
      WHERE OF."orderId" = orderId) AS tab
         INNER JOIN "Food" AS food ON tab."foodId" = food."foodId"
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION getOrderPagination(
    lm INTEGER,
    os INTEGER,
    sc INTEGER
)
    RETURNS TABLE
            (
                orderId    INTEGER,
                tableId    INTEGER,
                orderTime  TIMESTAMP,
                finishTime TIMESTAMP,
                payTime    TIMESTAMP,
                orderedBy  INTEGER,
                finishedBy INTEGER,
                statusCode INTEGER
            )
AS
$$
SELECT *
FROM "Order" AS o
WHERE o."statusCode" = sc
ORDER BY o."orderId"
OFFSET os ROWS FETCH NEXT lm ROWS ONLY;
$$ LANGUAGE sql;

SELECT COUNT(*) as count FROM "Order" WHERE "statusCode" = 0