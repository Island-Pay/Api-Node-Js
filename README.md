# IslandPay API Docs

**Demo Api Link:** [https://island-pay-private-api.onrender.com](https://island-pay-private-api.onrender.com)

**Live Link:** [https://island-pay-private-api.onrender.com](https://island-pay-private-api.onrender.com)

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
    Authorization:'Bearer auth'
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
    middleName: string,
    username: string,
    email: string,
    phone_number: number,
    country: string,
    password: string,
    pin: Number // 4 digit pin
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

### Register 2 verify Email send otp (GET) -- /register/verify/email/1?email=joe@doe.com

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

### Register 2 verify Email otp (POST) -- /register/verify/email/1?email=joe@doe.com

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

### Register 3 verify Phone Number send otp (GET) -- /register/verify/phoneNumber/1?phone_number=2348133092341

> This is the route to send otp to verify email.

**Query**

```
  {
    phone_number: number
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

### Register 3 verify Phone Number otp (POST) -- /register/verify/phoneNumber/1
> This is the route to send otp to verify Phone Number.


**Inputs**

```
  {
    userPhoneNo:Number
    OTP:Number
  }
```


**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Message": "Phone number verified successfully"
  }
```

---

### Register 4 userdetails (POST) -- /register/userdetails?email=joe@doe.com

> This is the route to register user details

**Query**

```
  {
    email: string
  }
```


**Inputs**

```
  {
    'dateOfBirth': NativeDate,
    'address': string,
    'city': string,
    'state': string,
    'country': string,
    'zipCode': string
  }
```


**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Data": {
      'dateOfBirth': NativeDate,
      'address': string,
      'city': string,
      'state': string,
      'country': string,
      'zipCode': string
    }
  }
```

---

### Login (POST) -- /login

> This is the route to login

**Inputs**

```
  {
    email: string,
    password: string,
  }
```

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Data": {
        "LoginSteps":{
          "step1": boolean,
          "emailVerify": boolean,
          "phoneNoVerify": boolean,
          "UserDetails": boolean
        },

        "BasicVerification":Boolean,
        "BasicVerificationDetails":{
          Email: boolean,
          Phone: boolean
        },

        "KYCVerification":boolean,
        "KYCVerificationDetails":{
          "Bank": boolean,
          "ID": boolean
        },

        "Email": string,
        "PhoneNumber": string,

        "UserDetails":null/{
          "User":{
            "firstName": string,
            "lastName": string,
            "username": string,
            "email": string,
            "phone_number": number,
            "country": string,
            "Referral": string
          },
          "Details":{
            'dateOfBirth': NativeDate,
            'address': string,
            'city': string,
            'state': string,
            'country': string,
            'zipCode': string
          }
        },
        Auth: null/String
    }
  }
```
---

### ForgotPassword (POST) ~ /forgotpassword/1
> This is the route to send otp for forget password

**Input**
```
{
  "email":String,         
}
```

**output**
```

  {
    "Access": true,
    "Error:false/Error,
    "Message": "OTP sent to your email successfully."
  }
```
---

### ForgotPassword (POST) ~ /forgotpassword/2
> Route for verifying of OTP and reset password of user
 
**Input**
```
{
  "email":String,
  "otp": Number,
  "password":String      
}
```

**Output**
```
{
  "Access": true,
  "Message": "Password reset successfully."
}
```

---


## Deposit 

> This is where all auth route like login, register and all

---

### Get deposit link (POST) -- /deposit?currency=NGN

> This is the route to get deposit link.

**Query**

```
  {
    currency: "NGN" | "KES" | "GHS" | "USD"
  }
```
>This is the customer desire currency to deposit in.

**Inputs**

```
  {
    amount:Number
  }
```

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "RedirectURl": String
  }
```

---

## Send money 

> This is where send money to

---

### Send through IslandPay (POST) -- /sendmoney?currency=NGN

> This is the route to send money to fellow island pay users.

**Query**

```
  {
    currency: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP" 
  }
```
>This is the customer desire currency to send money to.

**Inputs**

```
  {
    amount:Number,
    reciever: String,
    pin:Number
  }
```
>reciever: This is reciever username

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Transaction": {
      "amount":Number,
      "charges":Number,
      "type":String,
      "naration":String,
      "from":String,
      "to":String,
      "process":String,
      "createdAt": NativeDate
    }
  }
```

---

## Convert money 

> This is where you convert currencies

---

### get rate (GET) -- /convert/get-rate?from=USD&to=NGN
> This is the route to get rate.

**Query**

```
  {
    from: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP",
    to: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP"
  }
```
>This is the customer desire currency to convert money from and to.


>reciever: This is reciever username

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Rate": Number
  }
```

---

### convert money (POST) -- /convert/convert
> This is the route to convert the money.

**Input**

```
  {
    from: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP",
    to: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP",
    pin:String,
    amount:Number
  }
```
>This is the customer desire currency to convert money from and to.


>reciever: This is reciever username

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Converted": true
  }
```

---

router.get('/',VerifyJWTToken,async (req, res) => {

## Walet Details 

> This is where you get wallet details

---

### get details (GET) -- /wallet/details
> This is the route to get full wallet details.


>reciever: This is reciever username

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Balance": {
      Wallet:{
        Ngn: number,
        Usd: number,
        Kes: number,
        Zar: number,
        Ghs: number,
        Xof: number,
        Xaf: number,
        Gbp: number,
      },
      Transactions:[
        {
          "amount":Number,
          "charges":Number,
          "type":String,
          "naration":String,
          "from":String,
          "to":String,
          "process":String,
          "createdAt": NativeDate
        }
      ],
      virtualCard:[
        {
          card_number: string;
          card_type: "Visa" | "MasterCard";
          expiration_date: NativeDate;
          cvv: number;
          balance: number;
          currency: "NGN" | "USD";
          status: "active" | ... 1 more ... | "blocked";
        }
      ]
    }
  }
```

---

### convert money (POST) -- /convert/convert
> This is the route to convert the money.

**Input**

```
  {
    from: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP",
    to: "NGN" | "USD" | "KES" | "ZAR" | "GHS" | "XOF" | "XAF" | "GBP",
    pin:String,
    amount:Number
  }
```
>This is the customer desire currency to convert money from and to.


>reciever: This is reciever username

**Output**

```
  {
    "Access": true,
    "Error": false/Error,
    "Converted": true
  }
```

---

router.get('/',VerifyJWTToken,async (req, res) => {
