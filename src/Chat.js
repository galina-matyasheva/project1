import React from "react";
import io from "socket.io-client";//из библиотеки express.js


class Chat extends React.Component{
    constructor(props){
        super(props);//вызвать конструктор родителя
        this.state = {
            username: '',
            message: '',
            messages: []
        };

        this.socket = io('localhost:8080');

        this.sendMessage = ev => {//послать новое сообщение серверу
            if(!this.state.username||this.state.username.trim() === ''){
                return;
            }
            if(!this.state.message||this.state.message.trim() === ''){
                return;
            }
            ev.preventDefault();
            this.socket.emit('SEND_MESSAGE', {
                author: this.state.username,
                message: this.state.message
            });
            this.setState({message: ''});//очистить поле сообщений после посылки
        };

        this.refreshHistory= ev => {
            this.socket.emit('SEND_MESSAGE', { // только  получить историю сообщений
            });
        };

        const addMessage = data => {//добавить сообщения в историю на сервер
            this.setState({messages: data});
            console.log("current history: " + this.state.messages);
        };

        this.socket.on('RECEIVE_HISTORY', function(data){
            addMessage(data);//получить историю сообщений с сервера
        });
    }

    render(){
        return (

            <div className="container">
                <div className="row">
                    <div className="col-4 col-centered">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">
                                    Добро пожаловать в глобальный чат!</div>
                                <hr/>
                                <div className="messages">
                                    {this.state.messages.map(message => {//отрисовка истории сообщений
                                        return (
                                            <div><span class="colortext">{message.author}</span>: {message.message}</div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="card-footer">
                                <input type="text" placeholder= "Имя пользователя" className="form-control"
                                       value={this.state.username}
                                       onChange={ev => this.setState({username: ev.target.value})} />
                                <br/>
                                <input type="text" placeholder="Сообщение" className="form-control"
                                       value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
                                <br/>
                                <button onClick={this.sendMessage} className="btn btn-primary form-control">Отправить</button>
                                <div class = "button-refresh-history">
                                    </div>
                                <button onClick={this.refreshHistory} className="btn btn-primary form-control">Обновить историю</button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Chat;
