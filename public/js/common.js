function getLoginUser() {

    const user = localStorage.getItem("weatherUser");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        return null;
    }
}


function setLoginUser(user) {

    localStorage.setItem(
        "weatherUser",
        JSON.stringify(user)
    );

}


function logout() {

    localStorage.removeItem("weatherUser");

    alert("로그아웃되었습니다.");

    location.href = "/";

}


function requireLogin() {

    const user = getLoginUser();

    if (!user) {

        alert("로그인이 필요한 기능입니다.");

        location.href = "/login.html";

        return null;
    }

    return user;
}


function updateNavigation() {

    const user = getLoginUser();

    const loginArea =
        document.getElementById("loginArea");

    if (!loginArea) {
        return;
    }


    if (user) {

        loginArea.innerHTML = `
            <span class="text-white me-3">
                ${user.name}님
            </span>

            <a
                href="/mypage.html"
                class="btn btn-outline-light btn-sm me-2"
            >
                마이페이지
            </a>

            <button
                onclick="logout()"
                class="btn btn-danger btn-sm"
            >
                로그아웃
            </button>
        `;

    } else {

        loginArea.innerHTML = `
            <a
                href="/login.html"
                class="btn btn-outline-light btn-sm me-2"
            >
                로그인
            </a>

            <a
                href="/signup.html"
                class="btn btn-light btn-sm"
            >
                회원가입
            </a>
        `;

    }

}


document.addEventListener(
    "DOMContentLoaded",
    updateNavigation
);