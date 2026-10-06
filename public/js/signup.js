const signupForm =
    document.getElementById("signupForm");


signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const userID =
            document.getElementById("userID").value.trim();

        const password =
            document.getElementById("password").value;

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phoneNumber =
            document.getElementById("phoneNumber").value.trim();

        const gender =
            document.getElementById("gender").value;


        try {

            const response =
                await fetch("/api/users", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        userID,
                        password,
                        name,
                        email,
                        phoneNumber,
                        gender
                    })

                });


            const result =
                await response.json();


            alert(result.message);


            if (result.success) {

                location.href =
                    "/login.html";

            }


        } catch (error) {

            console.error(error);

            alert(
                "회원가입 중 서버 오류가 발생했습니다."
            );

        }

    }
);