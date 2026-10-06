const weatherResult =
    document.getElementById("weatherResult");

const btnFetchAll =
    document.getElementById("btnFetchAll");

const btnSaveWeather =
    document.getElementById("btnSaveWeather");


async function fetchWeather() {

    weatherResult.innerHTML = `
        <div class="col-12 text-center">
            <div class="spinner-border text-light"></div>
            <p class="mt-3">날씨를 불러오는 중...</p>
        </div>
    `;


    try {

        const response =
            await fetch("/api/weather");


        if (!response.ok) {
            throw new Error(
                "날씨 API 호출 실패"
            );
        }


        const result =
            await response.json();


        displayWeather(result.data);


    } catch (error) {

        console.error(error);

        weatherResult.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    날씨 정보를 불러오지 못했습니다.
                </div>
            </div>
        `;

    }

}


function displayWeather(data) {

    weatherResult.innerHTML = "";


    data.forEach(weather => {

        const card =
            document.createElement("div");

        card.className =
            "col-12 col-md-6 col-lg-4";


        card.innerHTML = `
            <div class="weather-card">

                <h3>
                    📍 ${weather.city}
                </h3>

                <div class="temperature">
                    ${weather.temperature}℃
                </div>

                <div class="weather-info">

                    <p>
                        💧 습도:
                        ${weather.humidity}%
                    </p>

                    <p>
                        💨 풍속:
                        ${weather.windSpeed} m/s
                    </p>

                    <p class="text-muted">
                        측정:
                        ${weather.time}
                    </p>

                </div>

                <button
                    class="btn btn-outline-primary"
                    onclick="addFavoriteFromWeather('${weather.city}')"
                >
                    ⭐ 관심지역
                </button>

            </div>
        `;


        weatherResult.appendChild(card);

    });

}


async function addFavoriteFromWeather(cityName) {

    const user = getLoginUser();


    if (!user) {

        alert(
            "관심지역을 등록하려면 로그인해주세요."
        );

        location.href = "/login.html";

        return;
    }


    try {

        const citiesResponse =
            await fetch("/api/cities");

        const citiesResult =
            await citiesResponse.json();


        const city =
            citiesResult.data.find(
                item => item.cityName === cityName
            );


        if (!city) {

            alert("도시 정보를 찾을 수 없습니다.");

            return;
        }


        const response =
            await fetch("/api/favorites", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    userID: user.userID,
                    cityID: city.cityID
                })

            });


        const result =
            await response.json();


        alert(result.message);


    } catch (error) {

        console.error(error);

        alert("관심지역 등록 중 오류가 발생했습니다.");

    }

}


async function saveWeather() {

    try {

        const response =
            await fetch(
                "/api/weather/save",
                {
                    method: "POST"
                }
            );


        const result =
            await response.json();


        alert(result.message);


    } catch (error) {

        console.error(error);

        alert("날씨 저장에 실패했습니다.");

    }

}


btnFetchAll.addEventListener(
    "click",
    fetchWeather
);


btnSaveWeather.addEventListener(
    "click",
    saveWeather
);


document.addEventListener(
    "DOMContentLoaded",
    fetchWeather
);