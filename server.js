const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const FASTAPI_URL =
    process.env.FASTAPI_URL || "http://127.0.0.1:8000";


/* =========================================
   MySQL 연결
========================================= */

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "weatherDB",

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


/* =========================================
   기본 설정
========================================= */

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


/* =========================================
   기본 페이지
========================================= */

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


/* =========================================
   Health Check
========================================= */

app.get("/api/health", async (req, res) => {

    try {

        const [rows] = await pool.query(
            "SELECT 1 AS result"
        );

        res.json({
            success: true,
            node: "ok",
            mysql: rows[0].result === 1,
            fastapi: FASTAPI_URL
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "서버 상태 확인 실패"
        });

    }

});


/* =========================================
   FastAPI - 전체 날씨
========================================= */

app.get("/api/weather", async (req, res) => {

    try {

        const response = await fetch(
            `${FASTAPI_URL}/api/weather`
        );

        if (!response.ok) {
            throw new Error(
                `FastAPI 오류: ${response.status}`
            );
        }

        const result = await response.json();

        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "날씨 정보를 가져오지 못했습니다."
        });

    }

});


/* =========================================
   FastAPI - 특정 도시
========================================= */

app.get(
    "/api/weather/:cityKey",
    async (req, res) => {

        try {

            const response = await fetch(
                `${FASTAPI_URL}/api/weather/${req.params.cityKey}`
            );

            const result = await response.json();

            if (!response.ok) {
                return res.status(response.status).json(result);
            }

            res.json(result);

        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "날씨 정보를 가져오지 못했습니다."
            });

        }

    }
);


/* =========================================
   회원가입
========================================= */

app.post("/api/users", async (req, res) => {

    const {
        userID,
        password,
        name,
        email,
        phoneNumber,
        gender
    } = req.body;

    if (
        !userID ||
        !password ||
        !name ||
        !email ||
        !gender
    ) {

        return res.status(400).json({
            success: false,
            message: "필수 항목을 입력해주세요."
        });

    }


    if (userID.length < 4) {

        return res.status(400).json({
            success: false,
            message: "아이디는 4자 이상이어야 합니다."
        });

    }


    if (password.length < 8) {

        return res.status(400).json({
            success: false,
            message: "비밀번호는 8자 이상이어야 합니다."
        });

    }


    try {

        const [existing] = await pool.query(
            `
            SELECT userID, email, phoneNumber
            FROM userTBL
            WHERE userID = ?
               OR email = ?
               OR (
                    ? IS NOT NULL
                    AND phoneNumber = ?
               )
            `,
            [
                userID,
                email,
                phoneNumber || null,
                phoneNumber || null
            ]
        );


        if (existing.length > 0) {

            const user = existing[0];

            if (user.userID === userID) {

                return res.status(409).json({
                    success: false,
                    message: "이미 존재하는 아이디입니다."
                });

            }

            if (user.email === email) {

                return res.status(409).json({
                    success: false,
                    message: "이미 사용 중인 이메일입니다."
                });

            }

            if (
                phoneNumber &&
                user.phoneNumber === phoneNumber
            ) {

                return res.status(409).json({
                    success: false,
                    message: "이미 사용 중인 전화번호입니다."
                });

            }

        }


        await pool.query(
            `
            INSERT INTO userTBL
            (
                userID,
                password,
                name,
                email,
                phoneNumber,
                gender
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                userID,
                password,
                name,
                email,
                phoneNumber || null,
                gender
            ]
        );


        res.status(201).json({
            success: true,
            message: "회원가입이 완료되었습니다."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "회원가입 중 오류가 발생했습니다."
        });

    }

});


/* =========================================
   로그인
========================================= */

app.post("/api/login", async (req, res) => {

    const {
        userID,
        password
    } = req.body;


    if (!userID || !password) {

        return res.status(400).json({
            success: false,
            message: "아이디와 비밀번호를 입력해주세요."
        });

    }


    try {

        const [rows] = await pool.query(
            `
            SELECT
                userID,
                name,
                email,
                phoneNumber,
                gender
            FROM userTBL
            WHERE userID = ?
              AND password = ?
            `,
            [
                userID,
                password
            ]
        );


        if (rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "아이디 또는 비밀번호가 올바르지 않습니다."
            });

        }


        res.json({
            success: true,
            message: "로그인 성공",
            user: rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "로그인 중 오류가 발생했습니다."
        });

    }

});


/* =========================================
   회원정보 조회
========================================= */

app.get("/api/users/:userID", async (req, res) => {

    try {

        const [rows] = await pool.query(
            `
            SELECT
                userID,
                name,
                email,
                phoneNumber,
                gender,
                createdAt,
                updatedAt
            FROM userTBL
            WHERE userID = ?
            `,
            [req.params.userID]
        );


        if (rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다."
            });

        }


        res.json({
            success: true,
            user: rows[0]
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "회원정보 조회 실패"
        });

    }

});


/* =========================================
   도시 목록
========================================= */

app.get("/api/cities", async (req, res) => {

    try {

        const [rows] = await pool.query(
            `
            SELECT
                cityID,
                cityName,
                latitude,
                longitude
            FROM cityTBL
            ORDER BY cityID
            `
        );


        res.json({
            success: true,
            data: rows
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "도시 목록 조회 실패"
        });

    }

});


/* =========================================
   관심지역 조회
========================================= */

app.get(
    "/api/favorites/:userID",
    async (req, res) => {

        try {

            const [rows] = await pool.query(
                `
                SELECT
                    c.cityID,
                    c.cityName,
                    c.latitude,
                    c.longitude
                FROM favoriteTBL f
                JOIN cityTBL c
                    ON f.cityID = c.cityID
                WHERE f.userID = ?
                ORDER BY c.cityID
                `,
                [req.params.userID]
            );


            res.json({
                success: true,
                data: rows
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "관심지역 조회 실패"
            });

        }

    }
);


/* =========================================
   관심지역 추가
========================================= */

app.post(
    "/api/favorites",
    async (req, res) => {

        const {
            userID,
            cityID
        } = req.body;


        if (!userID || !cityID) {

            return res.status(400).json({
                success: false,
                message: "사용자와 도시를 선택해주세요."
            });

        }


        try {

            await pool.query(
                `
                INSERT INTO favoriteTBL
                    (userID, cityID)
                VALUES (?, ?)
                `,
                [
                    userID,
                    cityID
                ]
            );


            res.status(201).json({
                success: true,
                message: "관심지역이 추가되었습니다."
            });


        } catch (error) {

            console.error(error);


            if (error.code === "ER_DUP_ENTRY") {

                return res.status(409).json({
                    success: false,
                    message: "이미 등록된 관심지역입니다."
                });

            }


            if (error.code === "ER_NO_REFERENCED_ROW_2") {

                return res.status(404).json({
                    success: false,
                    message: "사용자 또는 도시가 존재하지 않습니다."
                });

            }


            res.status(500).json({
                success: false,
                message: "관심지역 추가 실패"
            });

        }

    }
);


/* =========================================
   관심지역 삭제
========================================= */

app.delete(
    "/api/favorites/:userID/:cityID",
    async (req, res) => {

        try {

            const [result] = await pool.query(
                `
                DELETE FROM favoriteTBL
                WHERE userID = ?
                  AND cityID = ?
                `,
                [
                    req.params.userID,
                    req.params.cityID
                ]
            );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message: "관심지역을 찾을 수 없습니다."
                });

            }


            res.json({
                success: true,
                message: "관심지역이 삭제되었습니다."
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                success: false,
                message: "관심지역 삭제 실패"
            });

        }

    }
);


/* =========================================
   날씨 DB 저장
========================================= */

app.post("/api/weather/save", async (req, res) => {

    try {

        const response = await fetch(
            `${FASTAPI_URL}/api/weather`
        );

        if (!response.ok) {
            throw new Error("FastAPI weather error");
        }

        const result = await response.json();


        for (const weather of result.data) {

            const [cityRows] = await pool.query(
                `
                SELECT cityID
                FROM cityTBL
                WHERE cityName = ?
                `,
                [weather.city]
            );


            if (cityRows.length === 0) {
                continue;
            }


            const cityID = cityRows[0].cityID;


            await pool.query(
                `
                INSERT INTO weatherTBL
                (
                    cityID,
                    temperature,
                    humidity,
                    windSpeed
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    cityID,
                    weather.temperature,
                    weather.humidity,
                    weather.windSpeed
                ]
            );

        }


        res.json({
            success: true,
            message: "6개 도시 날씨가 DB에 저장되었습니다."
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "날씨 저장 실패"
        });

    }

});


/* =========================================
   서버 실행
========================================= */

async function startServer() {

    try {

        const connection = await pool.getConnection();

        console.log("MySQL 연결 성공");

        connection.release();


        app.listen(PORT, () => {

            console.log("");
            console.log("====================================");
            console.log(" 날씨 뉴스 앱 서버 실행");
            console.log(` http://localhost:${PORT}`);
            console.log(` FastAPI: ${FASTAPI_URL}`);
            console.log("====================================");
            console.log("");

        });

    } catch (error) {

        console.error("");
        console.error("MySQL 연결 실패");
        console.error(error.message);
        console.error("");

    }

}


startServer();