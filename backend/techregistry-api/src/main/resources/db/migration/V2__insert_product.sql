INSERT INTO product (name, description, price, quantity)
SELECT seed.name, seed.description, seed.price, seed.quantity
FROM (
    VALUES
        ('Notebook', 'Notebook Dell', 3500.00, 10),
        ('Mouse', 'Mouse Gamer', 150.00, 50),
        ('Teclado', 'Teclado Mecanico', 300.00, 20)
) AS seed(name, description, price, quantity)
WHERE '${seedDemoData}' = 'true'
  AND NOT EXISTS (SELECT 1 FROM product);