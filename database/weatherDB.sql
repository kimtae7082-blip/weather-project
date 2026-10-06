DROP DATABASE IF EXISTS weatherDB;

CREATE DATABASE weatherDB
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE weatherDB;


-- =========================================
-- 사용자 테이블
-- =========================================

CREATE TABLE userTBL (
    userID VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phoneNumber VARCHAR(20),
    gender ENUM('Female', 'Male') NOT NULL,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (userID),

    UNIQUE (email),
    UNIQUE (phoneNumber),

    CHECK (CHAR_LENGTH(userID) >= 4),
    CHECK (CHAR_LENGTH(password) >= 8)
);


-- =========================================
-- 도시 테이블
-- =========================================

CREATE TABLE cityTBL (
    cityID INT NOT NULL AUTO_INCREMENT,
    cityName VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,

    PRIMARY KEY (cityID),

    UNIQUE (cityName),

    CHECK (latitude >= -90 AND latitude <= 90),
    CHECK (longitude >= -180 AND longitude <= 180)
);


-- =========================================
-- 6개 도시 입력
-- =========================================

INSERT INTO cityTBL
    (cityName, latitude, longitude)
VALUES
    ('서울', 37.5665, 126.9780),
    ('부산', 35.1796, 129.0756),
    ('인천', 37.4563, 126.7052),
    ('대구', 35.8714, 128.6014),
    ('대전', 36.3504, 127.3845),
    ('광주', 35.1595, 126.8526);


-- =========================================
-- 관심지역 테이블
-- =========================================

CREATE TABLE favoriteTBL (
    userID VARCHAR(20) NOT NULL,
    cityID INT NOT NULL,

    PRIMARY KEY (userID, cityID),

    FOREIGN KEY (userID)
        REFERENCES userTBL(userID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (cityID)
        REFERENCES cityTBL(cityID)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================
-- 날씨 테이블
-- =========================================

CREATE TABLE weatherTBL (
    weatherID INT NOT NULL AUTO_INCREMENT,
    cityID INT NOT NULL,

    temperature DECIMAL(5,2) NOT NULL,
    humidity INT NOT NULL,
    windSpeed DECIMAL(5,2) NOT NULL,

    measuredAt DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (weatherID),

    FOREIGN KEY (cityID)
        REFERENCES cityTBL(cityID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CHECK (humidity >= 0 AND humidity <= 100),
    CHECK (windSpeed >= 0)
);


-- =========================================
-- 확인
-- =========================================

SHOW TABLES;

SELECT * FROM cityTBL;