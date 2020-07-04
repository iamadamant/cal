var eventBus = new Vue();

var event = {
    props: ['event'],
    template: `<div class="col-lg-4">
    <div class="card mt-4 shadow">
    <div class="card-body">
      <h5 class="card-title">{{ event.title }}</h5>
      <h6 class="card-subtitle mb-2 text-muted">{{ event.date.replace('T', ' ').replace('Z', '') }}</h6>
      <p class="card-text">{{ event.description }}</p>
      <a href="#" class="card-link" v-on:click="changeEvent">Изменить</a>
      <a href="#" class="card-link" v-on:click="deleteEvent" role="button">Удалить</a>
    </div>
    </div>
    </div>`,
    methods: {
        deleteEvent() {
            var success = confirm('Вы уверены что хотите удалить событие?');
            if (success) {
                fetch('http://localhost:8000/' + this.event.id + '/?user=' + this.$root.user, { method: 'DELETE' })
                this.$el.parentNode.removeChild(this.$el);
            }
        },

        changeEvent() {
            var newEvent = this.event;
            newEvent.date = this.event.date.replace('Z', '');
            this.$root.target = newEvent;
            $('#changeWindow').modal('show');
        }
    }
};



// Форма для изменнения/создания события
var createform = {
    data: function() {
        return {
            'description': '',
            'title': '',
            'id': null,
            'date': ''
        }

    },
    template: `
    <div>
    <button class="btn btn-outline-primary" style="position: fixed; right: 10px; bottom: 10px;" v-on:click="show">Создать событие</button>
<div class="modal fade" id="createWindow" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalCenterTitle">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form>
            <input type="datetime-local" name="" class="form-control mt-3" v-model='date' require>
            <input type="text" name="" placeholder="Заголовок" class="form-control mt-3" v-model='title' require>
            <textarea class="form-control mt-3" v-model='description' require></textarea>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" v-on:click="updateOrCreate">Сохранить</button>
      </div>
    </div>
  </div>
</div>
</div>`,
    methods: {
        updateOrCreate() {
            if (this.$root.user == 0) {
                alert("Пожалуйста, авторизуйтесь!");
                return;
            }
            var body = JSON.stringify({
                "title": this.title,
                "description": this.description,
                "date": this.date,
                "checked": false,
                "user": this.$root.user
            });
            var headers = {
                'content-type': 'application/json'
            }
            if (this.id != null) {
                this.updateEvent(body, headers);
            } else {
                this.createEvent(body, headers);
            }
        },

        updateEvent(body, headers) {
            this.date = this.date.substring(0, this.date.length - 3);
            var confident = confirm("Вы уверены что хотите изменить событие?");
            if (confident) {
                fetch('http://localhost:8000/' + this.id + '/', {
                    method: 'PUT',
                    body: body,
                    headers: headers
                });

                // Изменяем данные события в app.
                for (var i = 0; i < this.$root.events.length; i++) {
                    if (this.id = this.$root.events[i].id) {
                        this.$root.events[i].title = this.title;
                        this.$root.events[i].date = this.date;
                        this.$root.events[i].description = this.description;
                    }
                }
            }
        },

        show() {
            $('#createWindow').modal('show');
        },

        createEvent(body, headers) {
            var confident = confirm("Вы уверены что хотите создать событие?");
            if (confident) {
                fetch('http://localhost:8000/', {
                    method: 'POST',
                    body: body,
                    headers: headers
                }).then((response) => { return response.json() }).then((data) => this.id = data.id);
                this.$root.events.push(this);
                this.$root.empty = false;
            }

        },
    }
};

var changeform = {
    props: ['target'],
    template: `
    <div>
<div class="modal fade" id="changeWindow" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalCenterTitle">Изменить</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form>
            <input type="datetime-local" name="" class="form-control mt-3" v-model='target.date' require>
            <input type="text" name="" placeholder="Заголовок" class="form-control mt-3" v-model='target.title' require>
            <textarea class="form-control mt-3" v-model='target.description' require></textarea>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" v-on:click="updateEvent">Сохранить</button>
      </div>
    </div>
  </div>
</div>
</div>`,
    methods: {
        updateEvent() {
            var body = JSON.stringify({
                "title": this.target.title,
                "description": this.target.description,
                "date": this.target.date,
                "checked": false,
                "user": this.$root.user
            });
            var headers = {
                'content-type': 'application/json'
            }
            this.target.date = this.target.date.substring(0, this.target.date.length - 3);
            var confident = confirm("Вы уверены что хотите изменить событие?");
            if (confident) {
                fetch('http://localhost:8000/' + this.target.id + '/', {
                    method: 'PUT',
                    body: body,
                    headers: headers
                });
            }
        },
    }
};


// Компонент для регистрации пользователя
var register = {
    data: function() {
        return {
            'username': '',
            'password': '',
            'password_again': '',
            'mail': '',
            'target': 1,
            'incorrect_password': false,
            'incorrect_login': false,
            'similar_passwords': true,
            'bad_username': false
        }

    },
    template: `
        <div class="modal fade" id="registerWindow" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Авторизация</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item">
                    <a class="nav-link active" id="home-tab" data-toggle="tab" href="#home" role="tab" aria-controls="home" aria-selected="true" v-on:click="target=1">Регистрация</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="profile-tab" data-toggle="tab" href="#profile" role="tab" aria-controls="profile" aria-selected="false" v-on:click="target=2">Вход</a>
                </li>
                </ul>
                <div class="tab-content" id="myTabContent">
                    <div class="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                        <form>
                            <input type="text" class="form-control mb-3 mt-3" placeholder="Имя" v-model="username">
                            <div class="alert alert-danger" role="alert" v-if="bad_username">
                                Это имя уже занято!
                            </div>
                            <input type="password" class="form-control mb-3" placeholder="Пароль" v-model="password">
                            <input type="password" class="form-control mb-3" placeholder="Повторите пароль" v-model="password_again"> 
                            <div class="alert alert-danger" role="alert" v-if="!similar_passwords">
                                Пароли не совпадают!
                            </div>
                            <input type="mail" class="form-control" placeholder="Электронная почта" v-model="mail">
                        </form>
                    </div>
                    <div class="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                        <form>
                            <input type="text" class="form-control mt-3 mb-3" placeholder="Имя" v-model="username">
                            <div class="alert alert-danger" role="alert" v-if="incorrect_login">
                                Имя не корректно
                            </div>
                            <input type="password" class="form-control mb-3" placeholder="Пароль" v-model="password">
                            <div class="alert alert-danger" role="alert" v-if="incorrect_password">
                                Пароль не корректен
                            </div>
                        </form>
                    </div>
                </div>
            <br>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
                <button type="button" class="btn btn-primary" v-on:click="login">Ок</button>
            </div>
            </div>
        </div>
        </div>
    `,
    methods: {
        registerUser() {
            if (this.password == this.password_again) {
                fetch('http:/localhost:8000/register/', {
                        method: 'POST',
                        body: JSON.stringify({
                            'username': this.username,
                            'password': this.password,
                            'mail': this.mail
                        }),
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                    .then((response) => { return response.json() })
                    .then((data) => {
                        if (data['username'] == undefined) {
                            this.$root.setUser(data.user);
                            $('#registerWindow').modal('hide');
                        } else {
                            this.bad_username = true;
                            this.incorrect_login = false;
                            this.incorrect_password = false;
                            this.similar_passwords = true;
                        }
                    });
            } else {
                this.similar_passwords = false;
            }

        },

        login() {
            if (this.target == 2) {
                fetch('http:/localhost:8000/authorize/', {
                        method: 'POST',
                        body: JSON.stringify({
                            'username': this.username,
                            'password': this.password
                        }),
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                    .then((response) => { return response.json() })
                    .then((data) => {
                        if (data['error'] == undefined) {
                            this.$root.setUser(data.user);
                            $('#registerWindow').modal('hide');
                        } else {
                            if (data['error'] == 'login') {
                                this.incorrect_login = true;
                                this.incorrect_password = false;
                            } else {
                                this.incorrect_password = true;
                                this.incorrect_login = false;
                            }
                        }
                    });
            } else {
                this.registerUser();
            }

        },

    },
    mounted: function() {
        $('#registerWindow').modal();
    }

};


// Компонент, для получения фильтров событий(период, название и т.д)
var search = {
    data: function() {
        return {
            'period': 'all',
            'contains': '',
        }
    },
    template: `<form>
				<div class="form-group row">
                <div class="row w-100">
                    <div class="col-lg-3">
                        <select class="form-control" v-model="period">
                            <option value="day">За последний день</option>
                            <option value="week">За последнюю неделю</option>
                            <option value="month">За последний месяц</option>
                            <option value="all">За всё время</option>
                        </select>
                    </div>
                    <div class="col-lg-7">
                        <input type="text" class="form-control" v-model="contains">
                    </div>
                    <div class="col-lg-2">
                        <button class="btn btn-primary w-100" v-on:click="searchEvents">Искать</button>
                    </div>
                </div>
				</div>
			</form>`,
    methods: {
        searchEvents() {
            if (this.$root.user == 0) {
                alert("Пожалуйста, авторизуйтесь!");
                return;
            }

            this.$root.period = this.period;
            this.$root.contains = this.contains;
            this.$root.getData();
            this.period = 'all';
            this.contains = '';
        },
    }
};

var empty = {
    template: `
	 <div>
		 <h2 class="text-center mt-5 mb-5">Пусто</h2>
		 <p>Здесь пока ничего нет. Воспользуйтесь формой и добавьте событие.</p>
	 </div>`,
}


var app = new Vue({
    el: '#app',
    data: {
        events: [],
        target: {
            id: 0,
            title: '',
            date: '',
            description: ''
        },
        period: '',
        user: 0,
        contains: '',
        empty: false,
        is_auth: false
    },

    components: {
        'search': search,
        'register': register,
        'event': event,
        'createform': createform,
        'changeform': changeform
    },

    methods: {
        upa() {
            this.$refs.createform.showTarget();
        },

        getData() {
            fetch('http://localhost:8000/?user=' + this.user + '&format=json&date=' + this.period + '&content=' + this.contains, { method: 'GET' })
                .then(response => { return response.json() }).then(data => {
                    this.events = data;
                    this.empty = data == 0;
                });
        },

        setUser(user) {
            this.user = user;
            this.is_auth = true;
            this.getData();
        },
    },

});