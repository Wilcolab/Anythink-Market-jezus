import requests

url = "http://localhost:3000/api/"

output   = open("seed.out", "w")
response = open("seed.response", "w")
output.close()
response.close()

for i in range(100):
    #Add user
    username = 'user_'+str(i)
    user     = {"user": {"email": username+"@test.com", "password": "test","username": username}}
    x        = requests.post(url+"users", json = user)

    #login
    creds   = {"user": {"email": username+"@test.com","password": "test"}}
    login   = requests.post(url+"users/login", json = creds)
    token   = login.json()
    token   = token['user']['token']
    headers = {"Authorization": "Token "+token}

    #Add item
    title       = 'item-number-'+str(i)
    description =  title+' lorem epsum blah blah'
    item        = {"item": {"description": description,"image": "https://picsum.photos/200","tagList": [],"title": title}}
    y           = requests.post(url+"items", json = item, headers=headers)

    #comment
    comment = {"comment": {"body": "test comment for "+title }}
    z       = requests.post(url+"items/"+title+"/comments", json = comment, headers=headers)

    output = open("seed.out", "a")
    output.write(str(x.status_code)+" : "+str(y.status_code)+" : "+str(z.status_code)+" username : "+username+" item :  "+title+"\n")
    output.close()

    response = open("seed.response", "a")
    response.write("register response : "+x.text+"\nitem response : "+y.text+"\ncomment response : "+z.text+"\n\n")
    response.close()


