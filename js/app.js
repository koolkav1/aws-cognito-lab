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
					Name : 'custom:custom:linkedin',
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
		var authenticationData = {
			Username : $('#inputUsername').val(), // Get username & password from modal
			Password : $('#inputPassword2').val()
	  };
		$('#signInModal').modal("hide"); // Close the modal window
	  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	  var userData = {
			Username : authenticationData.Username,
			Pool : userPool
	  };
	  cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	  cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function (result) {
				createCredentials(result.getIdToken().getJwtToken());
				console.log("Signed in successfully");
	    },
	    onFailure: function(err) {
				if (err.message == '200'){  // 200 Success return
					cognitoUser = userPool.getCurrentUser();
					if (cognitoUser != null) {
						cognitoUser.getSession(function (err, result) { // Get ID token from session
			        if (err) {
								alert(err);
			        }
			        if (result) {
								createCredentials(result.getIdToken().getJwtToken());
								console.log("Signed to CognitoID in successfully");
			        }
			    	});
					}
					else {
						alert(JSON.stringify(err));
					}
				}
				else {
					alert(JSON.stringify(err));
				}
	    },
	  });
	}

	function createCredentials(idToken) {
		AWS.config.credentials = new AWS.CognitoIdentityCredentials({
			IdentityPoolId: identityPoolId,
			Logins : {
				// Change the key below according to your user pool and region.
				'cognito-idp.eu-west-1.amazonaws.com/eu-west-1_5oo05nVIq' : idToken
			}
		});
		//refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
		AWS.config.credentials.refresh((error) => {
				if (error) {
						 console.error(error);
						 bootbox.alert('Unable to sign in. Please try again.')
				} else {
						 // Instantiate aws sdk service objects now that the credentials have been updated.
						 // example: var s3 = new AWS.S3();
						 console.log('Successfully logged!');
						 bootbox.alert('You are now signed.');
				}
		});
	}
	// Sign Out
	function signOut() {
		if (cognitoUser != null) {
			bootbox.confirm({
				title: "Sign out",
				message: "Do you want to also invalidate all user data on this device?",
				buttons: {
					cancel: {
						label: '<i class="f fa-times"></i> No'
					},
					confirm: {
						label: '<i class="f fa-check"></i> Yes'
					}
				},
				callback: function (result) {
					if (result) {
						cognitoUser.globalSignOut({
							onSuccess: function(result) {
								bootbox.alert("Successfully signed out and  all app records");
							},
							onFailure: function(err) {
								alert(JSON.stringify(err));
							}
						});
					} else {
						cognitoUser.signOut();
						bootbox.alert("Signed out of app");
					}
				}
			});
		} else {
			bootbox.alert("You are not signed in");
		}
	}

	// Update profile
	function updateProfile(){
		if (cognitoUser != null) {
			console.log("Starting update process");
			
		var attributes = [
			{
				Name : 'given_name',
				Value : $('#inputGivenName2').val()
			},
			{
					Name : 'family_name',
					Value : $('#inputFamilyName2').val()
			},
			{
					Name : 'website',
					Value : $('#inputWebsite2').val()
			},
			{
					Name : 'gender',
					Value : $('#inputGender2').val()
			},
			{
					Name : 'birthdate',
					Value : $('#inputBirthdate2').val()
			},
			{
					Name : 'custom:custom:linkedin',
					Value : $('#inputLinkedin2').val()
			}
		];

		console.log("Adding attributes");
		var attributeList = [];
		for (var a= 0; a < attributes.length; a++) {
			var attributeTemp = new AmazonCognitoIdentity.CognitoUserAttribute(attributes[a]);
			attributeList.push(attributeTemp);
		}
		console.log("Updating profile");
		$('#updateModal').modal("hide"); //Close the modal window
		cognitoUser.updateAttributes(attributeList, function(err, result) {
			if (err) {
				alert(JSON.stringify(err.message));
				return;
			}
			console.log("call result: " + JSON.stringify(result));
			bootbox.alert("Successfully updated!");
		});
		} else {
			bootbox.alert("You are not signed in!");
		}
	}

	// Forgot password
	function forgotPassword(){
		var verificationCode, newPassword, forgotUser;
		console.log('Forgot Password');
		bootbox.prompt("Enter username or email", function(result){
			console.log("User: " + result);
			forgotUser = result;
			var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
			var userData = {
				Username : forgotUser,
				Pool : userPool
		  };
			console.log("Creating user " + JSON.stringify(userData));
		  cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
			cognitoUser.forgotPassword({
	        onSuccess: function (data) {
	            // successfully initiated reset password request
		          console.log('CodeDeliveryData from forgotPassword: ' + data);
	        },
	        onFailure: function(err) {
	            console.log(JSON.stringify(err.message));
	        },
	        //Optional automatic callback
	        inputVerificationCode: function(data) {
	            console.log('Code sent to: ' + JSON.stringify(data));
							bootbox.prompt('Please input verification code', function(result){
								verificationCode = result;
								bootbox.prompt('Enter new password ', function(result){
									newPassword = result;
									cognitoUser.confirmPassword(verificationCode, newPassword, {
			                onSuccess() {
			                    console.log('Password confirmed!');
													bootbox.alert('Password confirmed!');
			                },
			                onFailure(err) {
			                    console.log(JSON.stringify(err.message));
			                }
			            });
								});
							});
	        }
	    });
		});
	}

	// Get Cognito Sync token
	function getCognitoSynToken(){
	}

	// Create an S3 object
	function createObject(){
	}


// End 	self-invoking anonymous function
})(jQuery);
