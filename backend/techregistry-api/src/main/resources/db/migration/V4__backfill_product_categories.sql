UPDATE product
SET category = CASE
    WHEN name ILIKE '%Notebook%' THEN 'Computadores'
    WHEN name ILIKE '%Mouse%' THEN 'Perifericos'
    WHEN name ILIKE '%Teclado%' THEN 'Perifericos'
    WHEN name ILIKE '%Cabo%' THEN 'Acessorios'
    ELSE 'Sem categoria'
END
WHERE category IS NULL
   OR category = ''
   OR category = 'Sem categoria';
