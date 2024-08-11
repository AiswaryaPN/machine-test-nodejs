Create an Nodejs application with the following features (DB can be Mongo/MySql)
User previlages
There will be 2 users roles, Admin and manager
Admin user can access all the APIs, Manager user can acess all the API's except user management APIs
Router middleware should be used for validating previlage based access
Login
API should accept valid username and password
Passport JS need to be used
If incorrect username give an appropriate respose with message "User not found"
If incorrect password give an appropriate respose with message "Wrong password"
If a valid username and password, give an appropriate respose with a token and message "Login was a success"
The api request should be validated as
1) Should only accept valid email formats
2) Should accept only work emails and none of the free emails as provided in the list here (https://gist.github.com/tbrianjones/5992856)
3) Passwords should be a minimum of 8 letters with a combination of at least one number, one special character, and one Capital letter.

User Management APIS
APIs for create, update and delete users
Fields : First name, Last Name, Profile Picture, User type (Admin/Manager), email, Password
Should accept only work emails and none of the free emails as provided in the list here (https://gist.github.com/tbrianjones/5992856)
Pagination, Sort with first name, last name and user role
Search with all fileds except profile pic
Sort with all fileds except profile pic

Vegetable List API
API for list all Vegetabels in the db
Create and Update API
API to create a vegetable entry: Fields : color, price, name
Alll fieds are required.
Price must validated againest number/decimal
Color should be valid (should be a hexa decimal color value)
Detail API API to get a vegetable with particular id
Delete API API to delete an entry with particular id
