const user =
    requireLogin();


if (user) {

    loadUserInfo();

    loadCities();

    loadFavorites();

}


async function loadUserInfo() {

    try {

        const response =
            await fetch(
                `/api/users/${user.userID}`
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(result.message);

            return;
        }


        const data = result.user;


        document.getElementById(
            "userInfo"
        ).innerHTML = `

            <p>
                <strong>아이디</strong>
                ${data.userID}
            </p>

            <p>
                <strong>이름</strong>
                ${data.name}
            </p>

            <p>
                <strong>이메일</strong>
                ${data.email}
            </p>

            <p>
                <strong>전화번호</strong>
                ${data.phoneNumber || "-"}
            </p>

            <p>
                <strong>성별</strong>
                ${data.gender}
            </p>

            <p>
                <strong>가입일</strong>
                ${data.createdAt}
            </p>

        `;


    } catch (error) {

        console.error(error);

    }

}


async function loadCities() {

    try {

        const response =
            await fetch("/api/cities");


        const result =
            await response.json();


        const select =
            document.getElementById(
                "citySelect"
            );


        select.innerHTML =
            `<option value="">
                도시를 선택하세요
            </option>`;


        result.data.forEach(city => {

            select.innerHTML += `
                <option value="${city.cityID}">
                    ${city.cityName}
                </option>
            `;

        });


    } catch (error) {

        console.error(error);

    }

}


async function loadFavorites() {

    try {

        const response =
            await fetch(
                `/api/favorites/${user.userID}`
            );


        const result =
            await response.json();


        const list =
            document.getElementById(
                "favoriteList"
            );


        if (result.data.length === 0) {

            list.innerHTML = `
                <p class="text-muted">
                    등록된 관심지역이 없습니다.
                </p>
            `;

            return;
        }


        list.innerHTML = "";


        result.data.forEach(city => {

            list.innerHTML += `

                <div class="favorite-card">

                    <div
                        class="d-flex
                        justify-content-between
                        align-items-center"
                    >

                        <strong>
                            📍 ${city.cityName}
                        </strong>

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteFavorite(${city.cityID})"
                        >
                            삭제
                        </button>

                    </div>

                </div>

            `;

        });


    } catch (error) {

        console.error(error);

    }

}


document
    .getElementById("addFavoriteBtn")
    .addEventListener(
        "click",
        addFavorite
    );


async function addFavorite() {

    const cityID =
        document.getElementById(
            "citySelect"
        ).value;


    if (!cityID) {

        alert("도시를 선택해주세요.");

        return;
    }


    try {

        const response =
            await fetch(
                "/api/favorites",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userID: user.userID,
                        cityID: Number(cityID)
                    })

                }
            );


        const result =
            await response.json();


        alert(result.message);


        if (result.success) {

            loadFavorites();

        }


    } catch (error) {

        console.error(error);

        alert(
            "관심지역 추가 중 오류가 발생했습니다."
        );

    }

}


async function deleteFavorite(cityID) {

    if (
        !confirm(
            "이 관심지역을 삭제할까요?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `/api/favorites/${user.userID}/${cityID}`,
                {
                    method: "DELETE"
                }
            );


        const result =
            await response.json();


        alert(result.message);


        if (result.success) {

            loadFavorites();

        }


    } catch (error) {

        console.error(error);

        alert(
            "관심지역 삭제 중 오류가 발생했습니다."
        );

    }

}