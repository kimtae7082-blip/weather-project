from fastapi import FastAPI, HTTPException
import httpx
import asyncio

app = FastAPI(
    title="Weather News FastAPI",
    description="서울, 부산, 인천, 대구, 대전, 광주 날씨 API",
    version="1.0.0"
)


CITIES = {
    "seoul": {
        "name": "서울",
        "latitude": 37.5665,
        "longitude": 126.9780
    },
    "busan": {
        "name": "부산",
        "latitude": 35.1796,
        "longitude": 129.0756
    },
    "incheon": {
        "name": "인천",
        "latitude": 37.4563,
        "longitude": 126.7052
    },
    "daegu": {
        "name": "대구",
        "latitude": 35.8714,
        "longitude": 128.6014
    },
    "daejeon": {
        "name": "대전",
        "latitude": 36.3504,
        "longitude": 127.3845
    },
    "gwangju": {
        "name": "광주",
        "latitude": 35.1595,
        "longitude": 126.8526
    }
}


async def fetch_weather(city_key, city_info):
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": city_info["latitude"],
        "longitude": city_info["longitude"],
        "current": "temperature_2m,relative_humidity_2m,wind_speed_10m",
        "timezone": "Asia/Seoul"
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        data = response.json()

        current = data["current"]

        return {
            "cityKey": city_key,
            "city": city_info["name"],
            "temperature": current["temperature_2m"],
            "humidity": current["relative_humidity_2m"],
            "windSpeed": current["wind_speed_10m"],
            "time": current["time"]
        }


@app.get("/")
async def root():
    return {
        "message": "Weather News FastAPI 서버가 실행 중입니다."
    }


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "FastAPI"
    }


@app.get("/api/weather")
async def get_all_weather():

    tasks = [
        fetch_weather(city_key, city_info)
        for city_key, city_info in CITIES.items()
    ]

    results = await asyncio.gather(*tasks)

    return {
        "success": True,
        "count": len(results),
        "data": results
    }


@app.get("/api/weather/{city_key}")
async def get_city_weather(city_key: str):

    if city_key not in CITIES:
        raise HTTPException(
            status_code=404,
            detail="존재하지 않는 도시입니다."
        )

    result = await fetch_weather(
        city_key,
        CITIES[city_key]
    )

    return {
        "success": True,
        "data": result
    }