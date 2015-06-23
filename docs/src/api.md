FORMAT: 1A
HOST: http://orange.amida-tech.com

# Orange API

Orange is a medication adherence app. This is a quasi-REST API for the Orange
backend, primarily allowing sharing between patients and caregivers.

All API endpoints must be prefixed with a version number: for example,
`/v1/auth/token` not just `/auth/token`. Currently `v1` is the only API version.

All data should be sent JSON-encoded, and all responses are returned in JSON.

Throughout this document, we make the distinction between a user and a patient.
A user is an email/password pair, used to sign into the app, authenticate with the API,
and so on. A patient is someone we hold medication/adherence/etc data for. There is
a many-to-many association between users and patients: one user may own many patients
(for example, a mother collecting data both for herself and her son), and one patient
can be owned by many users (the concept of caregivers: the care of the son -- the patient
-- can be managed by both the mother and the father -- the users).

This is a private API, and if you have permission to use it you'll already have a _client
secret_ in the form of a hexstring. This should be sent in the `X-Client-Secret` header,
for example

```http
X-Client-Secret: CLIENT_SECRET
```

### Response Status Codes
#### Success
All successful requests return responses with the following error codes:
 - `GET`, `PUT` and `DELETE` return `200` on success
 - `POST` returns `201` on success

#### Error
Error responses have [standard HTTP error codes](http://www.restapitutorial.com/httpstatuscodes.html),
along with an array of machine-readable error slugs in the `errors` key of the JSON response.

For example, when attempting to access user details without authentication

```http
Status: 401 Access denied
```

```javascript
{
    success: false,
    errors: ['wrong_email_password']
}
```

If an unknown error occurs, the response code will be `500` and `errors` will
contain the `unknown_error` key.

