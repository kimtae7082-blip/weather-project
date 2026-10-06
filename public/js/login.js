const loginForm =
    document.getElementById("loginForm");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const userID =
            document.getElementById("userID").value.trim();

        const password =
            document.getElementById("password").value;


        try {

            const response =
                await fetch("/api/login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        userID,
                        password
                    })

                });


            const result =
                await response.json();


            if (!response.ok) {

                alert(result.message);

                return;
            }


            localStorage.setItem(
                "weatherUser",
                JSON.stringify(result.user)
            );


            alert("로그인되었습니다.");


            location.href = "/";


        } catch (error) {

            console.error(error);

            alert(
                "로그인 중 서버 오류가 발생했습니다."
            );

        }

    }
);