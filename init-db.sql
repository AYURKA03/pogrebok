-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    patronymic VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица продуктов
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20),
    storage_location VARCHAR(50),
    added_date DATE DEFAULT CURRENT_DATE,
    shelf_life_days INTEGER,
    expiry_date DATE
);

-- Таблица списка покупок
CREATE TABLE IF NOT EXISTS shopping_list (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50),
    purchased BOOLEAN DEFAULT FALSE
);

-- Таблица рецептов
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    instructions TEXT
);

-- Таблица ингредиентов рецептов
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2),
    unit VARCHAR(20)
);

-- Таблица утилизированных продуктов
CREATE TABLE IF NOT EXISTS disposed_products (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity DECIMAL(10,2),
    expiry_date DATE,
    disposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_expiry ON products(expiry_date);
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);

-- Добавляем тестовые рецепты
INSERT INTO recipes (name, instructions) VALUES 
('Омлет', 'Яйца взбить с молоком, добавить соль. Жарить на сковороде с маслом 3-5 минут.'),
('Греческий салат', 'Нарезать огурцы, помидоры, добавить оливки и сыр фета. Заправить маслом.'),
('Борщ', 'Сварить бульон из мяса. Добавить нарезанную свёклу, капусту, картофель. Добавить томатную пасту. Подавать со сметаной.')
ON CONFLICT DO NOTHING;

-- Добавляем ингредиенты для рецептов
INSERT INTO recipe_ingredients (recipe_id, name, amount, unit) VALUES 
(1, 'яйца', 3, 'шт'),
(1, 'молоко', 50, 'мл'),
(1, 'соль', NULL, 'по вкусу'),
(1, 'масло сливочное', 10, 'г'),
(2, 'огурцы', 2, 'шт'),
(2, 'помидоры', 2, 'шт'),
(2, 'сыр фета', 100, 'г'),
(2, 'оливки', 50, 'г'),
(2, 'масло оливковое', 2, 'ст.л'),
(3, 'свёкла', 1, 'шт'),
(3, 'капуста', 300, 'г'),
(3, 'картофель', 3, 'шт'),
(3, 'мясо', 500, 'г'),
(3, 'томатная паста', 2, 'ст.л'),
(3, 'сметана', NULL, 'по вкусу')
ON CONFLICT DO NOTHING;