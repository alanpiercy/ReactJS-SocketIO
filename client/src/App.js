import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import socketIOClient from 'socket.io-client';
//import logo from './logo.svg';
import './App.css';

var gSocket;

var ClientToServer = {
  PING: 'client/ping',
};
const ServerToClient = {
  SRC_CHANGED: 'server/src_changed',
  HELP: 'server/help',
};

class OurForm extends Component{
  onClick(){
    if (gSocket){
      gSocket.emit(ClientToServer.PING, {data: 1}, function(err, result){
        if (err){
          alert(err);
          return;
        }
        alert(JSON.stringify(result));
      });
    }
  }
  render(){
    return(
      <div>
        <button type='button' className='btn btn-lg btn-warning' onClick = {() => this.onClick()}>
          Ping server over socket.io
        </button>
      </div>
    );
  }
}

class App extends Component{
  constructor(){
    super();
    this.state = {
      endpoint: 'http://127.0.0.1:3000'
    };
  }
  componentDidMount(){
    const {endpoint} = this.state;
    gSocket = socketIOClient(endpoint);
    gSocket.on(ServerToClient.SRC_CHANGED, function(){
      window.location.reload();
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">React Client with Socket.io and Client Reload</h1>
        </header>
        <p className="App-intro">
          Change file <code>src/App.js</code> and save to reload.
        </p>
        <OurForm />
      </div>
    );
  }
}

export default App;