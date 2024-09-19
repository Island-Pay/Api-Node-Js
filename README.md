# IslandPay API Docs

**Demo Api Link:** [https://buzzy-ng-api.onrender.com](https://buzzy-ng-api.onrender.com)

**Live Link:** [https://api.buzzy.ng](https://api.buzzy.ng)

## API Tutorial

### Name of Route (method) -- /routes/:id?name=...

> The above will be stated for details of the route.
>
> The /:id is the params that will be parsed in the route

**Params**

```
  { 
    id:Number
  }
```

> The above are params to be passed in the route still broken down for you

**Query**

```
  {
    name: string
  }
```

> The above are query to be passed in the route still broken down for you

**Headers**

```
  {
    ...
    authorization:auth
  }
```

> The above is headers which must be used in every route to validate a user.

**Inputs**

```
  {
    Name:String
  }
```

> The above are Inputs to be sent to the server and this will only be shown when a post request is required

**Output**

```
  {
    Access:Boolean,
    Error:Error/false,
    ...
  }
```

> The above are Output that the server will respond.
>
> In every request, there wil be Access and Error, they are very important for you guys,
>
> **Access:** meaning route was gotten and accessed... Meaning it was available
>
> **Error:** If there is no error , error value will always be false. If there is any error, status code will be 500 and error will parsed there ine the error value. If you wanna get the error, use following code below, Also make sure to also use try and catch in catching these error with axios.

```
try{
  await axios({
  ...
  })
}catch(error){
  ...
  error.response.data.Error
}
```

> Always pass the error response to users. Its been validated for them so you wont stress in validation

### StatusCodes

1. **200/300**: Your are safe.
2. **500** : you have an error.
3. **400/404**: Page not found.

# Routes

> This is where all routes are

## Authentication 

> This is where all auth route like login, register and all

---

### Register1 (POST) -- /register/1

> This is the first route for register, you perform this before any.

**Inputs**

```
  {
    firstName: string,
    lastName: string,
    username: string,
    email: string,
    mobileNo: number,
    country: string,
  }
```

> **PhoneNumber:** please phone number should be 2348133092341, depend on country code
>
> **Referral:** This is who referred the user and its not required at all inputs

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Data": {
        "firstName": "Yamaela",
        "lastName": "Karies",
        "middleName": "Olumeide",
        "username": "yamalea123",
        "email": "yamala.karise@example.com",
        "mobileNo": 12345367890,
        "country": "Nigeria",
        "password": "$2a$10$c3xVtRdXzwTZcP3IVeOUjOS359hih2XzZfzQTPgpujN9KziPbtY.u",
        "email_verif": false,
        "mobile_number_verif": false,
        "kyc": false,
        "bank_verif": false,
        "id_verif": false,
        "agree_to_terms": false,
        "_id": "66eabc2c573f074c4c6874c1",
        "createdAt": "2024-09-18T11:40:28.930Z",
        "updatedAt": "2024-09-18T11:40:28.930Z",
        "__v": 0
    }
    }
```

---

### Register 2 verify Email send otp (GET) -- /verify/email/1?email=joe@doe.com

> This is the route to send otp to verify email.

**Query**

```
  {
    email: string
  }
```


**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    Sent:true/null
  }
```

---

### Register 2 verify Email otp (GET) -- /verify/email/1?email=joe@doe.com

> This is the route to send otp to verify email.

**Query**

```
  {
    email: string
  }
```

**Inputs**

```
  {
    otp:String
  }
```


**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    Verified:true/null
  }
```

---