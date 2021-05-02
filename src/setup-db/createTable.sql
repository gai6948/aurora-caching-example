CREATE TABLE rental_shop (
    shop_id VARCHAR(36) NOT NULL,
    shop_name VARCHAR(50) NOT NULL,
    shop_location VARCHAR(30) NOT NULL,
    PRIMARY KEY (shop_id)
);

CREATE TABLE movies (
    movie_id VARCHAR(36) NOT NULL,
    movie_name VARCHAR(50) NOT NULL,
    popularity INT NOT NULL DEFAULT 0,
    PRIMARY KEY (movie_id)
);

CREATE TABLE shop_movie(
    shop_id VARCHAR(36) NOT NULL,
    movie_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (shop_id, movie_id),
    FOREIGN KEY (shop_id)
        REFERENCES rental_shop(shop_id),
    FOREIGN KEY (movie_id)
        REFERENCES movies(movie_id)
);