import requests

def add_user(payload):
    addUser = requests.post('http://192.168.15.44:3000/api/user', data=payload)
    return addUser.json()

def get_users():
    getUsers = requests.get('http://192.168.15.44:3000/api/users')
    return getUsers.json()

def add_place(payload):
    addPlace = requests.post('http://192.168.15.44:3000/api/place', data=payload)
    return addPlace.json()

def get_places(city):
    getPlaces = requests.get('http://192.168.15.44:3000/api/places?city=' + city)
    return getPlaces.json()

def get_place(id_place):
    getPlace = requests.get('http://192.168.15.44:3000/api/place?id=' + id_place)
    return getPlace.json()

def add_comment(payload):
    addComment = requests.post('http://192.168.15.44/api/comment', data=payload)
    return addComment.json()

def get_comments(id_place):
    getComments = requests.get('http://192.168.15.44:3000/api/comment?' + id_place)
    return getComments.json()

while True:
    print(
    '''
    TESTE DA API

    PRESSIONE AS SEGUINTES TECLAS PARA TESTAR CADA FUNCIONALIDADE:
        [1] Add User
        [2] Get Users
        [3] Add Place
        [4] Get Places
        [5] Get Place
        [6] Add Comment
        [7] Get Comments
        [8] Exit

    ''')

    option = input('Insira uma opção: ')

    if option == '1':
        data = {
            'username': input('Username: '),
            'email': input('Email: '),
            'password': input('Password: ')
        }
        print(add_user(data))
    elif option == '2':
        print(get_users())
    elif option == '3':
        data = {
            'placename': input('Placename: '),
            'email': input('Email: '),
            'password': input('Password: '),
            'photos': ['http://photo.com/1', 'http://photo.com/2'],
            'address': input('Address: '),
            'city': input('City: ')
        }
        print(add_place(data))
    elif option == '4':
        data = {
            'city': input('City: '),
        }
        print(get_places(data['city']))
    elif option == '5':
        data = {
            'id': input('Id: ')
        }
        print(get_place(data['id']))
    elif option == '6':
        data = {
            'token': input('Token: '),
            'id_place': input('IdPlace: '),
            'comment': input('Comment: '),
            'grade': input('Grade: '),
            'timestamp': input('Timestamp: ')
        }
        print(add_comment(data))
    elif option == '7':
        data = {
            'id_place': input('IdPlace: ')
        }
        print(get_comments(data['id_place']))
    elif option == '8':
        break