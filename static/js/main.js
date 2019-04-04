// RENDER TEMPLATES
const testTemplate = require('../../templates/handlebars/test.hbs');
const dashboardRecipeTemplate = require('../../templates/handlebars/dashboard-recipes.hbs');
const dashboardUserTemplate = require('../../templates/handlebars/dashboard-personal.hbs');

// JAVASCRIPT MODULES
const Croppie = require('croppie');




// ----------------------------------------------------------------------------- CROPPIE LISTENERS
let croppieObject;
$('.croppie-file-input').on('change', event => {
    if ($('.croppie-file-input')[0].files[0]) {
        console.log('Image found in input field');

        const fileupload = $('.croppie-file-input')[0].files[0];
        const reader = new FileReader();

        // Read data in reader object
        reader.readAsDataURL(fileupload);

        // Function: start croppie object and bind image to div
        reader.onloadend = function () {
            croppieObject = $('#croppie').croppie({
                viewport: {
                    width: 210,
                    height: 280
                },
                boundary: { width: 300, height: 300 },
            });
            croppieObject.croppie('bind', {
                url: this.result
            });
        }
    } else {
        console.log('No file found in input field');
    }
});

$('.my-button').on('click', function () {
    if (croppieObject) {
        croppieObject.croppie('result', {
            type: 'base64',
            format: 'jpg',
            size: { width: 300, height: 400 }
        }).then(resp => {
            $('.my-image').attr('src', resp);

            // Send response to sercer
            fetch('/image', {
                method: 'POST',
                body: JSON.stringify({ data: resp.split(',')[1] }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => console.log(res))
        })
    } else {
        console.log('No croppie object found');
    }
})

// ----------------------------------------------------------------------------- SIGN UP
const signupUser = btn => {
    // Get form data
    const form = btn.parentNode.parentNode.parentNode;

    const formParams = {
        firstname: form.querySelector('[name=firstname]').value,
        lastname: form.querySelector('[name=lastname]').value,
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value,
        repeatpassword: form.querySelector('[name=repeat_password]').value
    };

    // Check email
    if (formParams.email === '') {
        M.toast({ html: 'Please provide an email', classes: 'red darken-1' });
        var email = $('[name=email]')[0];
        $(email).addClass('invalid');
        return;
    }

    // Check password
    if (formParams.password === '') {
        M.toast({ html: 'Please provide a password', classes: 'red darken-1' });
        var password = $('[name=password]')[0];
        $(password).addClass('invalid');
        return;
    }

    // Check password equal
    if (formParams.password !== formParams.repeatpassword) {
        M.toast({ html: 'Passwords are not equal', classes: 'red darken-1' });
        var password = $('[name=password]')[0];
        var repeatpassword = $('[name=repeat_password]')[0];
        $(password).addClass('invalid');
        $(repeatpassword).addClass('invalid');
        return;
    }


    // Modify DOM with loading text
    $(btn).toggleClass('disabled');
    $('.signup-loading').css('visibility', 'visible');

    // Send POST method to backend server
    fetch('/signup', {
        method: 'POST',
        body: $.param(formParams),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => {
        // Convert response to JSON
        return res.json();
    }).then(data => {
        if (data.status == 'ok') {
            // Provicde message to user
            M.toast({ html: 'Success!', classes: 'light-green darken-1' });

            // Remove loading text
            $('.signup-loading').css('visibility', 'hidden');

            // Redirect
            setTimeout(() => window.location.replace('/dashboard'), 1000);
        } else if (data.status == 'failed') {
            // Provicde message to user
            M.toast({ html: 'Email address already in use', classes: 'red darken-1' });

            // Set email form input to red
            var email = $('[name=email]')[0];
            $(email).addClass('invalid');

            // Reset button and loading text
            $(btn).toggleClass('disabled');

            // Remove loading text
            $('.login-loading').css('visibility', 'hidden');
        }


    }).catch(err => {
        console.log(err)
    })

}

// ----------------------------------------------------------------------------- LOGIN
const logInUser = btn => {
    // Get form data
    const form = btn.parentNode.parentNode.parentNode;

    const formParams = {
        email: form.querySelector('[name=email]').value,
        password: form.querySelector('[name=password]').value
    };

    // Check email
    if (formParams.email === '') {
        M.toast({ html: 'Please provide an email', classes: 'red darken-1' });
        var email = $('[name=email]')[0];
        $(email).addClass('invalid');
        return;
    }

    // Check password
    if (formParams.password === '') {
        M.toast({ html: 'Please provide a password', classes: 'red darken-1' });
        var password = $('[name=password]')[0];
        $(password).addClass('invalid');
        return;
    }


    // Modify DOM with loading text
    $(btn).toggleClass('disabled');
    $('.login-loading').css('visibility', 'visible');

    // Send POST method to backend server
    fetch('/login', {
        method: 'POST',
        redirect: 'follow',
        body: $.param(formParams),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(res => {
        // Check for redirect
        if (res.redirected) {
            return window.location.replace(res.url);
        }

        // Convert response to JSON
        return res.json();
    }).then(data => {
        if (data.status == 'failed') {
            // Provicde message to user
            M.toast({ html: data.message, classes: 'red darken-1' });

            // Remove loading text
            $('.login-loading').css('visibility', 'hidden');

            // Reset button and loading text
            $(btn).toggleClass('disabled');
        }


    }).catch(err => {
        console.log(err)
    })

}

// ----------------------------------------------------------------------------- ADD RECIPE
const addRecipe = btn => {
    const form = btn.parentNode.parentNode.parentNode;

    // Get values from input fields
    const formParams = {
        title: form.querySelector('[name=title]').value,
        description: form.querySelector('[name=description]').value,
        recipe: form.querySelector('[name=recipe]').value,
        image_name: "",
        image_base64: ""
    };

    // Check if file was uploaded
    if ($('.croppie-file-input')[0].files[0]) {
        console.log($('.croppie-file-input')[0].files[0])
        formParams.image_name = $('.croppie-file-input')[0].files[0].name;
    } else {
        return M.toast({ html: 'Please upload a photo', classes: 'red darken-1' });
    }

    // Check if values are not empty
    if (formParams.title == "" || formParams.description == "" || formParams.recipe == "") {
        return M.toast({ html: 'Please fill in all input fields', classes: 'red darken-1' });
    }

    // Check if croppie object exists
    if (croppieObject) {
        croppieObject.croppie('result', {
            type: 'base64',
            format: 'jpg',
            size: { width: 300, height: 400 }
        }).then(resp => {

            // Add base64 image data
            formParams.image_base64 = resp.split(',')[1];

            // Open load bar
            $('body').append(`<div class="loader-container">
                                    <div class="loader"></div>
                                </div>`);

            // Send response to sercer
            fetch(window.location.origin + '/recipe', {
                method: 'POST',
                body: JSON.stringify(formParams),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => {
                console.log(res)
                if (res.redirected) {
                    return window.location.replace(res.url);
                }
            })
        })
    } else {
        return M.toast({ html: 'Please upload a photo', classes: 'red darken-1' });
    }
}


function myTest() {
    const data = [
        {
            name: 'hoi'
        },
        {
            name: 'doei'
        }
    ]


    console.log(testTemplate(data));
}


// ----------------------------------------------------------------------------- GET USER RECIPES
const getUserRecipes = () => {
    // Get all recipe data from user
    fetch(window.location.origin + '/recipe/user', {
        method: 'GET',
        redirect: 'follow'
    }).then(res => {
        // Get json object
        return res.json()
    }).then(resObj => {
        // Render template
        const htmlString = dashboardRecipeTemplate(resObj);

        // Edit html DOM
        $('#recipe-loader').remove();
        $('#recipe-container').append(htmlString);
    })

}

// ----------------------------------------------------------------------------- GET USER DATA
const getUserData = () => {
    // Get all recipe data from user
    fetch(window.location.origin + '/user', {
        method: 'GET',
        redirect: 'follow'
    }).then(res => {
        // Get json object
        return res.json()
    }).then(resObj => {
        // Render template
        const htmlString = dashboardUserTemplate(resObj);

        // Edit html DOM
        $('#user-loader').remove();
        $('#user-container').append(htmlString);
    })

}

// ----------------------------------------------------------------------------- EXPORTS
module.exports = {
    signupUser: signupUser,
    logInUser: logInUser,
    addRecipe: addRecipe,
    getUserRecipes: getUserRecipes,
    getUserData: getUserData
}

// https://codepen.io/asrulnurrahim/pen/WOyzxy