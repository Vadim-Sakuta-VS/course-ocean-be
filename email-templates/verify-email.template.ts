export const verifyEmailTemplate = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport"
        content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
</head>
<body>
<h1>Hello! Welcome to CourseOcean</h1>
<p style="color: #807d7d;">To confirm your email, click the button</p>
<a style="display: inline-block; text-decoration: none; background-color: #0d6294; color: #ffffff; padding: 20px; border-radius: 18px;" href="{{ verifyEmailUrl }}" target="_blank">Confirm email</a>
<p style="color: #807d7d;">Please ignore this message if your email does not require verification.</p>
</body>
</html>
`;
