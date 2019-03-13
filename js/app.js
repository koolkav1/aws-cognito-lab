// Self-invoking anonymous function
(function($) {
	'use strict';

	// Hide the loading spinner image.
	$('#spinnerShow').hide();

	// Show the buttons
	$('#buttonSection').show();

	// Click event listeners for buttons
	$('#btnSignUp').click(function() {
	  signUp();
	});

	$('#btnSignIn').click(function() {
	  signIn();
	});

	$('#btnSignOut').click(function() {
	  signOut();
	});

	$('#btnUpdate').click(function() {
	  updateProfile();
	});

	$('#forgotPassword').click(function() {
	  forgotPassword();
	});

	$('#btnSync').click(function() {
	  getCognitoSynToken();
	});

	$('#btnS3').click(function() {
	  createObject();
	});

	/***************** The main code ******************/
	/***************** The main code ******************/

	// Region must be defined
	AWS.config.region = 'eu-west-1';

	// User pool
	var poolData = {
			UserPoolId : 'eu-west-1_5oo05nVIq', // Your user pool id here
			ClientId : '6opfdeu0qn8khv3kogu7o1s3ua' // Your app client id here
	};

	// Your identity pool id here
	var identityPoolId = "eu-west-1:2d218a72-ae59-4bb9-872f-cc52408c7ea6"

	// Cognito Sync store name
	var cognitoDatasetName = "backspace-users";

	var cognitoUser, identityId, cognitosync;

		function signUp(){
		console.log('Starting Sign up process');

		// Close the modal window
		$('#signUpModal').modal("hide");

		// Get sign up information from modal
		var userLogin = {
			username : $('#inputPreferredUsername').val(),
			password : $('#inputPassword').val()
		}

		var attributes = [
			{
				Name : 'given_name',
				Value : $('#inputGivenName').val()
			},
			{
					Name : 'family_name',
					Value : $('#inputFamilyName').val()
			},
			{
					Name : 'email',
					Value : $('#inputEmail').val()
			},
			{
					Name : 'preferred_username',
					Value : $('#inputPreferredUsername').val()
			},
			{
					Name : 'website',
					Value : $('#inputWebsite').val()
			},
			{
					Name : 'gender',
					Value : $('#inputGender').val()
			},
			{
					Name : 'birthdate',
					Value : $('#inputBirthdate').val()
			},
			{
					Name : 'custom:linkedin',
					Value : $('#inputLinkedin').val()
			}
		];

		var params = {
		  ClientId: poolData.ClientId, 	/* required */
		  Password: userLogin.password, /* required */
		  Username: userLogin.username, /* required */
		  ValidationData: [],						/* required */
		  UserAttributes: attributes
		};

		var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
		cognitoidentityserviceprovider.signUp(params, function(err, data) {
		  if (err) {
				console.log(err, err.stack); // an error occurred
				alert('Error: '+ JSON.stringify(err));
			}
		  else {
				console.log(JSON.stringify(data));           // successful response
				if (data.UserConfirmed) {
					bootbox.alert('Sign up successful.');
				}
				else{
					bootbox.alert('Please check your email for a verification link.');
				}
			}
		});
	}

	// Sign In
	function signIn(){
	}

	// Sign Out
	function signOut() {
	}

	// Update profile
	function updateProfile(){
	}

	// Forgot password
	function forgotPassword(){
	}

	// Get Cognito Sync token
	function getCognitoSynToken(){
	}

	// Create an S3 object
	function createObject(){
	}


// End 	self-invoking anonymous function
})(jQuery);
